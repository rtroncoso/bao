import { TILE_SIZE } from 'core/constants/game/Map';

export const WALKING_SPEED = 70;
export const RUNNING_SPEED = WALKING_SPEED * 1.4;

export const COLLISION_AREA = 0.25;
export const COLLISION_RADIUS = TILE_SIZE * COLLISION_AREA;

export default function Physic() {
  this.body = null;
  this.radius = COLLISION_RADIUS;
  this.speed = WALKING_SPEED;
}
