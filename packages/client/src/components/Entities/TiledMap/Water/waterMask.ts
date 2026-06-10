import { Graphics, RenderTexture, Renderer, SCALE_MODES } from 'pixi.js';

import { WaterPolygon } from '../Shore/waterPolygons';

export type { WaterPolygon };

export const createMaskRenderTexture = (
  width: number,
  height: number
): RenderTexture => {
  const texture = RenderTexture.create({
    width: Math.max(1, Math.ceil(width)),
    height: Math.max(1, Math.ceil(height)),
    resolution: 1
  });
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  return texture;
};

export const bakeWaterMask = (
  renderer: Renderer,
  target: RenderTexture,
  polygons: WaterPolygon[],
  originX: number,
  originY: number
): void => {
  const maskGraphics = new Graphics();
  maskGraphics.beginFill(0xffffff, 1);

  polygons.forEach((polygon) => {
    if (polygon.length < 3) return;

    const points: number[] = [];
    polygon.forEach((vertex) => {
      points.push(vertex.x - originX, vertex.y - originY);
    });
    maskGraphics.drawPolygon(points);
  });

  maskGraphics.endFill();

  renderer.render(maskGraphics, {
    renderTexture: target,
    clear: true
  });

  maskGraphics.destroy();
};

export { getWaterPolygons } from '../Shore/waterPolygons';
