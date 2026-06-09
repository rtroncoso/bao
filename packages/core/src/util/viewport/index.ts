import { Rectangle } from 'pixi.js';

import { TILE_SIZE } from '@bao/core/constants';
import { Tiled } from '@bao/core/models';

export const calculateProjectionMatrix = (
  tmx: Tiled,
  camera: Rectangle,
  cullingPx: number
) => {
  const mapWidthPx = tmx.width * TILE_SIZE;
  const mapHeightPx = tmx.height * TILE_SIZE;
  const bounds = new Rectangle();
  bounds.x = Math.max(camera.x - cullingPx, 0);
  bounds.y = Math.max(camera.y - cullingPx, 0);
  const maxX = Math.min(camera.x + camera.width + cullingPx, mapWidthPx);
  const maxY = Math.min(camera.y + camera.height + cullingPx, mapHeightPx);
  bounds.width = maxX - bounds.x;
  bounds.height = maxY - bounds.y;
  return bounds;
};
