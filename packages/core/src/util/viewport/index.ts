import { Rectangle } from 'pixi.js';

import { TILE_SIZE } from '@bao/core/constants';
import { Tiled } from '@bao/core/models';

// TODO : fix culling + bounds
export const calculateProjectionMatrix = (tmx: Tiled, camera: Rectangle, culling: number) => {
  const bounds = new Rectangle();
  bounds.x = Math.max(camera.x - culling * TILE_SIZE, 0);
  bounds.y = Math.max(camera.y - culling * TILE_SIZE, 0);
  bounds.width = camera.width + culling * TILE_SIZE;
  bounds.height = camera.height + culling * TILE_SIZE;
  return bounds;
};
