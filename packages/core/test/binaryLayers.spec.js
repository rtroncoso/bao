const { expect } = require('chai');

const { MAP_SIZE } = require('../dist/constants/game/Map');
const { LayeredTile } = require('../dist/models');
const {
  normalizeBinaryTileRows,
  mapBinaryLayers,
  parseBinaryTile,
} = require('../dist/loaders/maps/binary');
const { BufferAdapter } = require('../dist/util/BufferAdapter');

describe('normalizeBinaryTileRows', () => {
  it('maps binary tile rows to dense 0-indexed rows for mapLayers', () => {
    const tiles = mapBinaryLayers((x, y) => (
      new LayeredTile({ x, y, graphics: [x === 50 && y === 50 ? 42 : 0] })
    ));

    expect(tiles[49][49].x).to.equal(50);
    expect(tiles[49][49].y).to.equal(50);

    const rows = normalizeBinaryTileRows(tiles);

    expect(rows).to.have.length(MAP_SIZE);
    expect(rows[49][49].x).to.equal(50);
    expect(rows[49][49].y).to.equal(50);
    expect(rows[49][49].graphics[0]).to.equal(42);
    expect(rows[0][0].x).to.equal(1);
    expect(rows[0][0].y).to.equal(1);
  });
});

describe('parseBinaryTile', () => {
  it('reads sequential map/inf bytes for a single tile', () => {
    const mapBytes = new Uint8Array([0, 7, 0]);
    const infBytes = new Uint8Array([0]);
    const mapBuffer = new BufferAdapter(mapBytes.buffer);
    const infBuffer = new BufferAdapter(infBytes.buffer);

    const tile = parseBinaryTile(mapBuffer, infBuffer)(1, 1);

    expect(tile.graphics[0]).to.equal(7);
    expect(tile.x).to.equal(1);
    expect(tile.y).to.equal(1);
  });
});
