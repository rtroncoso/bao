import { TILE_SIZE } from '@bao/core/constants';
import { Graphic, MapObject, Npc, TileExit } from '@bao/core/models';

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
    return {
      x: this.x * TILE_SIZE - this.offsetX,
      y: this.y * TILE_SIZE - this.offsetY,
    };
  }

  isWater() {
    if (this.animation) {
      const animationId = Number(this.animation.id);
      if (animationId >= 1505 && animationId <= 1520) {
        return true;
      }
    }

    if (!this.graphic) {
      return false;
    }

    const graphicId = Number(this.graphic.id);
    if (graphicId >= 6000 && graphicId <= 6063) {
      return true;
    }

    return Number((this.graphic as Graphic).fileName) === 12052;
  }
}
