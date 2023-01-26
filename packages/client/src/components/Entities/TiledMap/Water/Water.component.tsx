import { WATER_LAYER } from '@bao/core';
import { Sprite, useTick } from '@inlet/react-pixi';
import {
  Graphics as PixiGraphics,
  Texture,
  Sprite as PixiSprite,
  WRAP_MODES,
  Point,
  Filter,
  Matrix
} from 'pixi.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from 'src/components/Game';
import { useMapContext, useViewportContext } from 'src/components/Systems';

import waterTexture from './water.png';
import waterNormal from './water_normal.png';
import displacementTexture from './water_uv_displacement.png';
import vertex from './water.vert';
import fragment from './water.frag';

export interface WaterProps {
  shapes?: Point[][];
}

export class WaterFilter extends Filter {
  constructor(vertex, fragment) {
    super(vertex, fragment);
    this.uniforms.camera = [0, 0];
    this.uniforms.time = 0;
    this.uniforms.tileFactor = [1.0, 1.0];
    this.uniforms.camera = [0, 0];
    this.uniforms.waveTimeScale = 0.1;
    this.uniforms.waveScale = [0.2, 0.2];
    this.uniforms.waveAmplitude = [0.02, 0.03];
    this.uniforms.uvTimeScale = -0.003;
    this.uniforms.uvOffsetSize = [2.7, 3.5];
    this.uniforms.uvAmplitude = [0.08, 0.15];
    this.uniforms.mappedMatrix = new Matrix();
    this.autoFit = false;
    this.padding = 0;
  }

  apply(filterManager, input, output, clear) {
    this.uniforms.dimensions[0] = input.filterFrame.width;
    this.uniforms.dimensions[1] = input.filterFrame.height;
    filterManager.applyFilter(this, input, output, clear);
  }
}

export const Water: React.FC<WaterProps> = ({ shapes = [] }) => {
  const { callbacks } = useGame();
  const { mapState } = useMapContext();
  const { viewportState } = useViewportContext();

  const water = useRef<PixiSprite>();
  const [shader, setShader] = useState<Filter>();

  const texture = Texture.from(waterTexture.src);
  const normal = Texture.from(waterNormal.src);
  const displacement = Texture.from(displacementTexture.src);

  texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
  normal.baseTexture.wrapMode = WRAP_MODES.REPEAT;
  displacement.baseTexture.wrapMode = WRAP_MODES.REPEAT;

  useEffect(() => {
    try {
      const shader = new WaterFilter(vertex, fragment);
      shader.uniforms.normalTexture = normal;
      shader.uniforms.displacementTexture = displacement;
      shader.uniforms.dimensions = [
        viewportState.projection.width,
        viewportState.projection.height
      ];

      setShader(shader);
    } catch (error) {
      callbacks.leaveRoom(error);
    }
  }, [normal, displacement, viewportState]);

  const mask = useMemo(() => {
    const g = new PixiGraphics();
    shapes.forEach((shape) => {
      const start = shape.shift();
      g.moveTo(start.x, start.y);
      shape.forEach((s) => g.lineTo(s.x, s.y));
      g.lineTo(start.x, start.y);
    });
    return g;
  }, [shapes]);

  useTick((delta) => {
    if (water.current) {
      const group = mapState.groups[WATER_LAYER];
      water.current.mask = mask;
      water.current.parentGroup = group;
      water.current.width = viewportState.projection.width;
      water.current.height = viewportState.projection.height;
      water.current.position.x = viewportState.projection.x;
      water.current.position.y = viewportState.projection.y;
    }

    if (shader) {
      shader.uniforms.time += delta * 0.03;
      shader.uniforms.camera[0] =
        viewportState.projection.x / viewportState.projection.width;
      shader.uniforms.camera[1] =
        viewportState.projection.y / viewportState.projection.height;
    }
  });

  return shader ? (
    <Sprite ref={water} texture={texture} filters={[shader]} />
  ) : null;
};
