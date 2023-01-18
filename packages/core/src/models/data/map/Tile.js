import { TILE_SIZE } from '@mob/core/constants/game/Map';

/**
 * Tile model
 * @property {Npc} npc
 * @property {MapObject} object
 * @property {TileExit} tileExit
 * @property {number} trigger
 * @property {boolean} blocked
 * @property {Graphic|number} graphic
 * @property {Graphic|number} animation
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} layer
 * @property {number} x
 * @property {number} y
 */
export default class Tile {
  constructor({
    blocked = false,
    animation = 0,
    graphic = 0,
    offsetX = 0,
    offsetY = 0,
    object = null,
    npc = null,
    tileExit = null,
    trigger = 0,
    layer = 0,
    x = 0,
    y = 0
  }) {
    this.npc = npc;
    this.animation = animation;
    this.graphic = graphic;
    this.blocked = blocked;
    this.object = object;
    this.tileExit = tileExit;
    this.trigger = trigger;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.layer = layer;
    this.x = x;
    this.y = y;
  }

  toScreen() {
    return { x: (this.x - this.offsetX) * TILE_SIZE, y: (this.y - this.offsetY) * TILE_SIZE };
  }

  isWater() {
    return this.animation && (this.animation.id >= 1505 && this.animation.id <= 1520);
  }
}
