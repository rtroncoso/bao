import Tile from '@mob/core/src/models/data/map/Tile';

/**
 * LayeredTile model
 * @property {Graphic[]} graphics
 */
export default class LayeredTile extends Tile {
  constructor({
    graphics = [],
    ...options
  }) {
    super(options);
    this.graphics = graphics;
  }
}
