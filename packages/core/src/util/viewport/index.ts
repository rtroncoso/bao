import { Rectangle } from 'pixi.js';

import { TILE_SIZE } from '@bao/core/constants';
import { Tiled } from '@bao/core/models';

// TODO : fix culling + bounds
export const calculateProjectionMatrix = (tmx: Tiled, camera: Rectangle, culling: number) => {
  const bounds = new Rectangle();
  bounds.x = Math.max(camera.x - 2 * culling, 0);
  bounds.y = Math.max(camera.y - 2 * culling, 0);
  bounds.width = camera.width + 3 * culling;
  bounds.height = camera.height + 4 * culling;
  return bounds;
};
