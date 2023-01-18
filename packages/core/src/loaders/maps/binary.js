import range from 'lodash/fp/range';
import { HEADER_SIZE, INF_HEADER_SIZE, MAP_SIZE } from '@mob/core/constants/game/Map';
import { parseTile, mapLayers } from '@mob/core/loaders/maps/json';
import LayeredTile from '@mob/core/models/data/map/LayeredTile';
import Npc from '@mob/core/models/data/map/Npc';
import TileExit from '@mob/core/models/data/map/TileExit';
import MapObject from '@mob/core/models/data/map/MapObject';
import BufferAdapter from '@mob/core/util/BufferAdapter';

/**
 * Parses basic & inf tile data from buffers
 * @param {BufferAdapter} mapBuffer
 * @param {BufferAdapter} infBuffer
 * @returns {function(x, y):LayeredTile}
 */
export const parseBinaryTile = (mapBuffer, infBuffer) => (x, y) => {
  const mapData = mapBuffer.getNextByte();
  const infData = infBuffer.getNextByte();

  let npc = null;
  let object = null;
  let tileExit = null;
  let trigger = 0;
  const tiles = [];
  const blocked = (mapData & 1) === 1;

  tiles[0] = mapBuffer.getNextInt16();
  if ((mapData & 2) === 2) tiles[1] = mapBuffer.getNextInt16();
  if ((mapData & 4) === 4) tiles[2] = mapBuffer.getNextInt16();
  if ((mapData & 8) === 8) tiles[3] = mapBuffer.getNextInt16();
  if ((mapData & 16) === 16) trigger = mapBuffer.getNextInt16();

  if ((infData & 1) === 1) {
    const map = infBuffer.getNextInt16();
    const tileX = infBuffer.getNextInt16();
    const tileY = infBuffer.getNextInt16();
    tileExit = new TileExit({ map, x: tileX, y: tileY });
  }

  if ((infData & 2) === 2) {
    const id = infBuffer.getNextInt16();
    npc = new Npc({ id, x, y });
  }

  if ((infData & 4) === 4) {
    const id = infBuffer.getNextInt16();
    const amount = infBuffer.getNextInt16();
    object = new MapObject({ id, amount, x, y });
  }

  return new LayeredTile({
    x,
    y,
    npc,
    blocked,
    object,
    tileExit,
    trigger,
    graphics: tiles
  });
};

/**
 * Iterates over a virtual map's tiles in -y --> +y / -x --> +x
 * @param action
 * @returns {*}
 */
export const iterate = (action = () => {}) => (
  range(1, MAP_SIZE + 1).map(y => range(1, MAP_SIZE + 1).map(x => action(x, y)))
);

/**
 * Reads and processes tile layers from a buffer
 * @param buffer
 * @param process
 * @returns {Array.<Array.<LayeredTile>>}
 */
export const mapBinaryLayers = (buffer, process) => iterate(process);

/**
 * Translates tile exits in x direction by `amount`
 * @param tiles
 * @param [amount=-4]
 * @returns {function(x,y):LayeredTile}
 */
export const translateTileExits = (tiles, amount = -4) => (x, y) => {
  y -= 1;
  x -= 1;

  if (tiles[y][x].tileExit && tiles[y][x + amount]) {
    tiles[y][x + amount].tileExit = tiles[y][x].tileExit;
    tiles[y][x].tileExit = null;
  }

  return tiles[y][x];
};

/**
 * Parses binary formatted `Map` structure from array buffer
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Uint8Array} mapFile
 * @param {Uint8Array} infFile
 * @param {Object.<string, MapInfo>} datFile
 * @param {Boolean} translateExits
 * @returns {Array.<Array.<LayeredTile>>}
 */
export const getBinaryTiles = (graphics, animations, mapFile, infFile, datFile, translateExits = false) => {
  const buffer = new BufferAdapter(mapFile.buffer);
  const infBuffer = new BufferAdapter(infFile.buffer);
  buffer.skipBytes(HEADER_SIZE);
  infBuffer.skipBytes(INF_HEADER_SIZE);
  const tiles = mapBinaryLayers(buffer, parseBinaryTile(buffer, infBuffer));
  if (translateExits) { iterate(translateTileExits(tiles)) }; // mutates tiles
  return tiles;
};

/**
 * Parses binary formatted `Map` structure from array buffer
 * into a layered format (analog to JSON)
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Array.<MapObject>} objects
 * @param {Uint8Array} mapFile
 * @param {Uint8Array} infFile
 * @param {Object.<string, MapInfo>} datFile
 * @returns {Array<Array<Array<Tile>>>}
 */
export const getBinaryLayers = (graphics, animations, objects, mapFile, infFile, datFile) => {
  const tiles = getBinaryTiles(graphics, animations, mapFile, infFile);
  const parse = parseTile(graphics, animations, objects);
  const parseJson = (data, layer, x, y) => {
    const g = {};
    let tile = tiles[y][x];
    tile.graphics.forEach((v, i) => g[i + 1] = v);
    tile = { g, b: tile.blocked, t: tile.trigger, o: tile.object, n: tile.npc, te: tile.tileExit };
    return parse(tile, layer, x, y);
  };

  return mapLayers(tiles, parseJson);
};

/**
 * Flattens binary formatted `Map` structure from `getBinaryLayers`
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Uint8Array} mapFile
 * @param {Uint8Array} infFile
 * @returns {Array.<Tile>}
 */
export const getFlattenedTiles = (graphics, animations, mapFile, infFile) => {
  const tiles = [];
  const rows = getBinaryTiles(graphics, animations, mapFile, infFile);
  rows.forEach((cols = []) => {
    cols.forEach(tile => tile && tiles.push(tile));
  });
  return tiles;
};

export default null;
