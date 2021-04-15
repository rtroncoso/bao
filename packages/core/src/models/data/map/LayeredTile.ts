import { Graphic, Tile } from '@mob/core/models';

/**
 * LayeredTile model
 */
export class LayeredTile extends Tile {
  graphics: Graphic[];

  constructor({
    graphics = [],
    ...options
  }) {
    super(options);
    this.graphics = graphics;
  }
}
