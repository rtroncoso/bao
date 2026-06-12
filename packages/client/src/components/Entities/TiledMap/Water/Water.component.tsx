import { WATER_LAYER, TmxObject } from '@bao/core';
import { Container, Graphics, Sprite, useTick } from '@inlet/react-pixi';
import {
  Container as PixiContainer,
  Graphics as PixiGraphics,
  Texture,
  Sprite as PixiSprite,
  WRAP_MODES,
  Point,
  Filter
} from 'pixi.js';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useMapContext, useViewportContext } from 'src/components/Systems';

import { registerAnimatedFilter } from '../Shore/effectAnimationRegistry';
import { getWaterPolygons } from '../Shore/waterPolygons';

import waterTexture from './water.png';
import waterNormal from './water_normal.png';
import displacementTexture from './water_uv_displacement.png';
import { WaterFilter } from './WaterFilter';

const assetUrl = (asset: string | { src: string }) =>
  typeof asset === 'string' ? asset : asset.src;

export interface WaterProps {
  water?: TmxObject[];
  mapWorldOffset?: { x: number; y: number };
}

export const Water: React.FC<WaterProps> = ({
  water = [],
  mapWorldOffset = { x: 0, y: 0 }
}) => {
  const { mapState } = useMapContext();
  const { projectionRef } = useViewportContext();

  const containerRef = useRef<PixiContainer>();
  const waterRef = useRef<PixiSprite>();
  const filterRef = useRef<WaterFilter>();
  const [mask, setMask] = useState<PixiGraphics>();
  const [filter, setFilter] = useState<Filter>();
  const [texture, setTexture] = useState<Texture>();
  const [normal, setNormal] = useState<Texture>();
  const [displacement, setDisplacement] = useState<Texture>();

  const waterGroup = mapState.groups[WATER_LAYER];

  const shapes = useMemo(
    () =>
      getWaterPolygons(water).map((polygon) =>
        polygon.map((p) => new Point(p.x, p.y))
      ),
    [water]
  );

  const drawMask = useCallback(
    (graphics: PixiGraphics) => {
      graphics.clear();
      shapes.forEach((shape) => {
        if (shape.length < 3) {
          return;
        }

        graphics.beginFill(0xffffff, 1);
        graphics.moveTo(shape[0].x, shape[0].y);
        for (let index = 1; index < shape.length; index++) {
          graphics.lineTo(shape[index].x, shape[index].y);
        }
        graphics.closePath();
        graphics.endFill();
      });
    },
    [shapes]
  );

  useEffect(() => {
    (async () => {
      const [textureResource, normalResource, displacementResource] =
        await Promise.all([
          Texture.fromURL(assetUrl(waterTexture)),
          Texture.fromURL(assetUrl(waterNormal)),
          Texture.fromURL(assetUrl(displacementTexture))
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
      const waterFilter = new WaterFilter();
      filterRef.current = waterFilter;
      setFilter(waterFilter);
      return registerAnimatedFilter(waterFilter);
    } catch (error) {
      console.error('[Water] failed to create water filter', error);
      return undefined;
    }
  }, []);

  useTick(() => {
    const waterFilter = filterRef.current;
    const container = containerRef.current;
    const sprite = waterRef.current;
    const projection = projectionRef.current;

    if (
      !waterFilter ||
      !container ||
      !sprite ||
      !texture ||
      !normal ||
      !displacement ||
      !container.parent
    ) {
      return;
    }

    container.x = projection.x - mapWorldOffset.x;
    container.y = projection.y - mapWorldOffset.y;
    sprite.width = projection.width;
    sprite.height = projection.height;

    waterFilter.uniforms.texture = texture;
    waterFilter.uniforms.normalTexture = normal;
    waterFilter.uniforms.displacementTexture = displacement;
    waterFilter.uniforms.camera[0] = projection.x / projection.width;
    waterFilter.uniforms.camera[1] = projection.y / projection.height;
  });

  if (!waterGroup || !filter || !texture || !shapes.length) {
    return null;
  }

  return (
    <Container ref={containerRef} parentGroup={waterGroup}>
      <Graphics ref={setMask} draw={drawMask} visible={false} />
      <Sprite ref={waterRef} mask={mask} texture={texture} filters={[filter]} />
    </Container>
  );
};
