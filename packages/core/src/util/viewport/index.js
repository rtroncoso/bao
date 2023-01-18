import { Rectangle } from 'pixi.js';
import { TILE_SIZE } from '@mob/core/constants/game/Map';

export const calculateProjectionMatrix = (tmx, camera, culling) => {
  const bounds = new Rectangle();
  bounds.x = Math.max(camera.x - culling, 0);
  bounds.y = Math.max(camera.y - culling, 0);
  bounds.width = Math.min(2 * culling + bounds.x + camera.width, tmx.width * TILE_SIZE);
  bounds.height = Math.min(2 * culling + bounds.y + camera.height, tmx.height * TILE_SIZE);
  return bounds;
};

export default null;
