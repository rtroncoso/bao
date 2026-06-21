const { expect } = require('chai');

const { TILE_SIZE } = require('@bao/core/constants/game/Map');
const { tileCoordsToScreenFromSize } = require('@bao/core/loaders/maps/screen');

describe('tileCoordsToScreenFromSize', () => {
  it('places sprite top-left so center-bottom aligns with tile anchor', () => {
    const width = 64;
    const height = 96;
    const tileX = 10;
    const tileY = 20;

    const { x, y } = tileCoordsToScreenFromSize(tileX, tileY, width, height);

    const anchorX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const anchorY = tileY * TILE_SIZE + TILE_SIZE;
    const spriteCenterX = x + width / 2;
    const spriteBottomY = y + height;

    expect(spriteCenterX).to.equal(anchorX);
    expect(spriteBottomY).to.equal(anchorY);
  });
});
