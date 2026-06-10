import { WATER_LAYER, TmxObject } from '@bao/core';
import { Graphics, Sprite, useTick } from '@inlet/react-pixi';
import {
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
}

export const Water: React.FC<WaterProps> = ({ water = [] }) => {
  const { mapState } = useMapContext();
  const { projectionRef } = useViewportContext();

  const waterRef = useRef<PixiSprite>();
  const filterRef = useRef<WaterFilter>();
  const [mask, setMask] = useState<PixiGraphics>();
  const [filter, setFilter] = useState<Filter>();
  const [texture, setTexture] = useState<Texture>();
  const [normal, setNormal] = useState<Texture>();
  const [displacement, setDisplacement] = useState<Texture>();

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

        graphics.moveTo(shape[0].x, shape[0].y);
        for (let index = 1; index < shape.length; index++) {
          graphics.lineTo(shape[index].x, shape[index].y);
        }
        graphics.closePath();
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
    const sprite = waterRef.current;
    const projection = projectionRef.current;

    if (
      !waterFilter ||
      !sprite ||
      !texture ||
      !normal ||
      !displacement ||
      !sprite.parent
    ) {
      return;
    }

    const group = mapState.groups[WATER_LAYER];
    if (group) {
      sprite.parentGroup = group;
    }

    sprite.x = projection.x;
    sprite.y = projection.y;
    sprite.width = projection.width;
    sprite.height = projection.height;

    waterFilter.uniforms.texture = texture;
    waterFilter.uniforms.normalTexture = normal;
    waterFilter.uniforms.displacementTexture = displacement;
    waterFilter.uniforms.camera[0] = projection.x / projection.width;
    waterFilter.uniforms.camera[1] = projection.y / projection.height;

    (sprite as unknown as { _boundsID: number })._boundsID++;
  });

  if (!filter || !texture || !shapes.length) {
    return null;
  }

  return (
    <>
      <Graphics
        ref={setMask}
        draw={drawMask}
        visible={false}
        parentGroup={mapState.groups[WATER_LAYER]}
      />
      <Sprite
        ref={waterRef}
        mask={mask}
        parentGroup={mapState.groups[WATER_LAYER]}
        texture={texture}
        filters={[filter]}
      />
    </>
  );
};
