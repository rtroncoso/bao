import { TILE_SIZE } from '@mob/core/constants';
import { Graphic, MapObject, Npc, TileExit } from '@mob/core/models';

/**
 * Tile model
 */
export class Tile {
  npc: Npc | null;
  animation: Graphic | null;
  graphic: Graphic | null;
  blocked: boolean;
  object: MapObject | null;
  tileExit: TileExit | null;
  trigger: number;
  offsetX: number;
  offsetY: number;
  layer: number;
  x: number;
  y: number;

  constructor({
    blocked = false,
    animation = null,
    graphic = null,
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
    return this.animation && (
      (this.animation as Graphic).id >= 1505 &&
      (this.animation as Graphic).id <= 1520
    );
  }
}
