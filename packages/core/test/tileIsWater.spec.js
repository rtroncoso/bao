const { expect } = require('chai');
const { Tile } = require('../dist/models/data/map/Tile');
const { Graphic } = require('../dist/models/data/shared/Graphic');

describe('Tile.isWater', () => {
  it('returns true only for animated water graphics 1505–1520', () => {
    const water = new Tile({
      animation: new Graphic({ id: 1510, frames: [1, 2, 3, 4] }),
      graphic: new Graphic({ id: 1510, fileName: 324 }),
      layer: 1,
      x: 0,
      y: 0
    });

    expect(water.isWater()).to.equal(true);
  });

  it('treats static grass/terrain graphics 6000–6063 as not water', () => {
    const grass = new Tile({
      graphic: new Graphic({ id: 6020, fileName: 12052 }),
      layer: 1,
      x: 0,
      y: 0
    });

    expect(grass.isWater()).to.equal(false);
  });
});
