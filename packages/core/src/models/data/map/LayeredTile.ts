import { Graphic } from '@bao/core/models';
import { Tile } from './Tile';

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
