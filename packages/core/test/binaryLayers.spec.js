const { expect } = require('chai');

const { MAP_SIZE } = require('../dist/constants/game/Map');
const { LayeredTile } = require('../dist/models');
const { MapObject, Npc } = require('../dist/models');
const {
  AO_INF_MARKER_X_OFFSET,
  iterate,
  normalizeBinaryTileRows,
  mapBinaryLayers,
  parseBinaryTile,
  translateInfSpawns,
} = require('../dist/loaders/maps/binary');
const { extractMapMeta } = require('../dist/loaders/maps/meta');
const { extractBlockedTilesFromLayers } = require('../dist/loaders/maps/blocking');
const { toWorldCoords } = require('../dist/loaders/maps/coords');
const { Tile } = require('../dist/models');
const { MAP_BORDER_X, MAP_BORDER_Y } = require('../dist/constants/game/Map');
const { BufferAdapter } = require('../dist/util/BufferAdapter');

const range = (start, end) => Array.from({ length: end - start }, (_, index) => start + index);

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

describe('translateInfSpawns', () => {
  it('moves object and NPC markers left by the AO inf X offset', () => {
    const tiles = mapBinaryLayers((x, y) => new LayeredTile({ x, y, graphics: [0] }));

    tiles[9][13].object = new MapObject({ id: 148, amount: 1, x: 14, y: 10 });
    tiles[9][13].npc = new Npc({ id: 504, x: 14, y: 10 });

    iterate(translateInfSpawns(tiles));

    expect(tiles[9][13].object).to.equal(null);
    expect(tiles[9][13].npc).to.equal(null);
    expect(tiles[9][9].object.id).to.equal(148);
    expect(tiles[9][9].npc.id).to.equal(504);
    expect(AO_INF_MARKER_X_OFFSET).to.equal(-4);
  });

  it('aligns extracted meta coords with the visual tile after translation', () => {
    const tiles = mapBinaryLayers((x, y) => new LayeredTile({ x, y, graphics: [0] }));
    const markerX = 22;
    const markerY = 15;
    const visualX = markerX + AO_INF_MARKER_X_OFFSET;

    tiles[markerY - 1][markerX - 1].object = new MapObject({
      id: 148,
      amount: 1,
      x: markerX,
      y: markerY,
    });

    iterate(translateInfSpawns(tiles));

    const meta = extractMapMeta(1, tiles);
    const spawn = meta.objects.find((entry) => entry.objectId === 148);

    expect(spawn).to.exist;
    expect(spawn.x).to.equal(toWorldCoords(visualX, markerY).x);
    expect(spawn.y).to.equal(toWorldCoords(visualX, markerY).y);
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

describe('extractBlockedTilesFromLayers', () => {
  it('converts collision tiles to world playable coords', () => {
    const legacyX = 50;
    const legacyY = 50;
    const world = toWorldCoords(legacyX, legacyY);
    const terrainLayer = range(0, MAP_SIZE).map((y) =>
      range(0, MAP_SIZE).map((x) => {
        if (x !== legacyX - 1 || y !== legacyY - 1) {
          return null;
        }

        return new Tile({
          blocked: true,
          layer: 1,
          x: legacyX,
          y: legacyY,
        });
      })
    );
    const emptyLayer = () =>
      range(0, MAP_SIZE).map(() => range(0, MAP_SIZE).map(() => null));
    const layers = [terrainLayer, emptyLayer(), emptyLayer()];

    const blocked = extractBlockedTilesFromLayers(layers);

    expect(blocked).to.deep.include({ x: world.x, y: world.y });
  });
});
