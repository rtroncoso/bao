const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const {
  computeGridNeighbors,
  getPrefetchMapIds,
  parseMapIdFromEntry,
} = require('@bao/core/loaders/maps/world');

const WORLDS_PATH = path.resolve(
  __dirname,
  '../../assets/public/worlds/worlds.json'
);

const TILE_SIZE = 32;
const MAP_WIDTH = 84;
const MAP_HEIGHT = 88;
const MAP_PIXEL_WIDTH = MAP_WIDTH * TILE_SIZE;
const MAP_PIXEL_HEIGHT = MAP_HEIGHT * TILE_SIZE;

describe('world map stitching', () => {
  let worlds;

  before(() => {
    worlds = JSON.parse(fs.readFileSync(WORLDS_PATH, 'utf8'));
  });

  const getEntry = (mapId) =>
    worlds.maps.find((entry) => parseMapIdFromEntry(entry) === mapId);

  it('stitches map 34 north edge flush with map 35', () => {
    const map34 = getEntry(34);
    const map35 = getEntry(35);

    expect(map34).to.exist;
    expect(map35).to.exist;
    expect(map34.x).to.equal(map35.x);
    expect(map34.y - map35.y).to.equal(MAP_PIXEL_HEIGHT);
  });

  it('places map 35 directly north of map 34 on the world grid', () => {
    const neighbors = computeGridNeighbors(34, worlds);

    expect(neighbors.north).to.equal(35);
    expect(neighbors.south).to.equal(87);
    expect(neighbors.west).to.equal(78);
    expect(neighbors.northWest).to.equal(80);
  });

  it('prefetches the north neighbor when standing in quadrant 1', () => {
    const ids = getPrefetchMapIds(34, 1, worlds);

    expect(ids).to.include(34);
    expect(ids).to.include(35);
    expect(ids.length).to.be.at.most(4);
  });

  it('keeps every map entry aligned to the world grid', () => {
    for (const entry of worlds.maps) {
      expect(entry.x % MAP_PIXEL_WIDTH).to.equal(0);
      expect(entry.y % MAP_PIXEL_HEIGHT).to.equal(0);
      expect(entry.width).to.equal(MAP_PIXEL_WIDTH);
      expect(entry.height).to.equal(MAP_PIXEL_HEIGHT);
    }
  });
});
