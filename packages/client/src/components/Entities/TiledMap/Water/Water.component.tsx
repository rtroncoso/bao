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
import { useGameContext } from 'src/components/Game';
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
    this.uniforms.time = 0;
    this.uniforms.camera = [0, 0];
    this.uniforms.dimensions = [0, 0];
    this.uniforms.tileFactor = [0.3, 0.3];
    this.uniforms.colorDamp = [0.9, 0.9, 0.8];
    this.uniforms.waveTimeScale = 0.05;
    this.uniforms.waveScale = [0.5, 0.5];
    this.uniforms.waveAmplitude = [0.02, 0.03];
    this.uniforms.uvTimeScale = -0.003;
    this.uniforms.uvOffsetSize = [2.2, 2.4];
    this.uniforms.uvAmplitude = [0.08, 0.15];
    this.uniforms.mappedMatrix = new Matrix();
    this.uniforms.texture = Texture.EMPTY;
    this.uniforms.normal = Texture.EMPTY;
    this.uniforms.displacement = Texture.EMPTY;
    this.autoFit = false;
    this.padding = 0;
    if (this.isRetina()) {
      this.resolution = 2;
    }
  }

  isRetina() {
    return (
      ((window.matchMedia &&
        (window.matchMedia(
          'only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)'
        ).matches ||
          window.matchMedia(
            'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)'
          ).matches)) ||
        (window.devicePixelRatio && window.devicePixelRatio >= 2)) &&
      /(iPad|iPhone|iPod|Macintosh)/g.test(navigator.userAgent)
    );
  }

  apply(filterManager, input, output, clear) {
    this.uniforms.dimensions[0] = input.filterFrame.width;
    this.uniforms.dimensions[1] = input.filterFrame.height;
    filterManager.applyFilter(this, input, output, clear);
  }
}

export const Water: React.FC<WaterProps> = ({ shapes = [] }) => {
  const { callbacks } = useGameContext();
  const { mapState } = useMapContext();
  const { viewportState } = useViewportContext();

  const water = useRef<PixiSprite>();
  const [shader, setShader] = useState<Filter>();
  const [texture, setTexture] = useState<Texture>();
  const [normal, setNormal] = useState<Texture>();
  const [displacement, setDisplacement] = useState<Texture>();

  useEffect(() => {
    (async () => {
      const [textureResource, normalResource, displacementResource] =
        await Promise.all([
          Texture.fromURL(waterTexture.src),
          Texture.fromURL(waterNormal.src),
          Texture.fromURL(displacementTexture.src)
        ]);

      textureResource.baseTexture.wrapMode = WRAP_MODES.REPEAT;
      normalResource.baseTexture.wrapMode = WRAP_MODES.REPEAT;
      displacementResource.baseTexture.wrapMode = WRAP_MODES.REPEAT;

      setTexture(textureResource);
      setNormal(normalResource);
      setDisplacement(displacementResource);
    })();
  }, []);

  useEffect(() => {
    try {
      const shader = new WaterFilter(vertex, fragment);
      setShader(shader);
    } catch (error) {
      callbacks.leaveRoom(error);
    }
  }, []);

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
    if (shader && water.current) {
      const group = mapState.groups[WATER_LAYER];
      water.current.parentGroup = group;
      shader.uniforms.time += delta * 0.05;
      shader.uniforms.texture = texture;
      shader.uniforms.normalTexture = normal;
      shader.uniforms.displacementTexture = displacement;
      shader.uniforms.camera[0] = water.current.x / water.current.width;
      shader.uniforms.camera[1] = water.current.y / water.current.height;
    }
  });

  return shader && texture ? (
    <Sprite
      ref={water}
      mask={mask}
      x={viewportState.projection.x}
      y={viewportState.projection.y}
      width={viewportState.projection.width}
      height={viewportState.projection.height}
      parentGroup={mapState.groups[WATER_LAYER]}
      texture={texture}
      filters={[shader]}
    />
  ) : null;
};
