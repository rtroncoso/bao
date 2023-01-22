import range from 'lodash/fp/range';
import { HEADER_SIZE, INF_HEADER_SIZE, MAP_SIZE } from '@bao/core/constants/game/Map';
import { JsonGraphicState } from '@bao/core/loaders/graphics';
import { parseJsonTile, mapLayers, JsonTile } from '@bao/core/loaders/maps/json';
import {
  Graphic,
  LayeredTile,
  MapObject,
  Npc,
  TileExit
} from '@bao/core/models';
import { BufferAdapter } from '@bao/core/util';

/**
 * Parses basic & inf tile data from buffers
 */
export const parseBinaryTile = (mapBuffer: BufferAdapter, infBuffer: BufferAdapter) => (
  (x: number, y: number) => {
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
  }
);

/**
 * Iterates over a virtual map's tiles in -y --> +y / -x --> +x
 */
export const iterate = (action: (x: number, y: number) => any = () => {}) => (
  range(1, MAP_SIZE + 1).map(y => range(1, MAP_SIZE + 1).map(x => action(x, y)))
);

/**
 * Reads and processes tile layers from a buffer
 */
export const mapBinaryLayers = (process: (x: number, y: number) => LayeredTile): LayeredTile[][] => (
  iterate(process)
);

/**
 * Translates tile exits in x direction by `amount`
 */
export const translateTileExits = (tiles: LayeredTile[][], amount: number = -4) => (
  (x: number, y: number) => {
    y -= 1;
    x -= 1;

    if (tiles[y][x].tileExit && tiles[y][x + amount]) {
      tiles[y][x + amount].tileExit = tiles[y][x].tileExit;
      tiles[y][x].tileExit = null;
    }

    return tiles[y][x];
  }
);

export interface GetBinaryTilesParameters {
  animations: Graphic[];
  datFile: string;
  graphics: JsonGraphicState;
  infFile: Uint8Array;
  mapFile: Uint8Array;
  translateExits?: boolean;
}

/**
 * Parses binary formatted `Map` structure from array buffer
 */
export const getBinaryTiles = ({
  // animations,
  // datFile,
  // graphics,
  infFile,
  mapFile,
  translateExits = false
}: GetBinaryTilesParameters) => {
  const buffer = new BufferAdapter(mapFile.buffer);
  const infBuffer = new BufferAdapter(infFile.buffer);
  buffer.skipBytes(HEADER_SIZE);
  infBuffer.skipBytes(INF_HEADER_SIZE);
  const tiles = mapBinaryLayers(parseBinaryTile(buffer, infBuffer));
  if (translateExits) { iterate(translateTileExits(tiles)) }; // mutates tiles
  return tiles;
};

export interface GetBinaryLayersParameters {
  animations: Graphic[];
  datFile: string;
  graphics: JsonGraphicState;
  infFile: Uint8Array;
  mapFile: Uint8Array;
  objects: MapObject[];
  translateExits?: boolean;
}

/**
 * Parses binary formatted `Map` structure from array buffer
 * into a layered format (analog to JSON)
 */
export const getBinaryLayers = ({
  animations,
  datFile,
  graphics,
  infFile,
  mapFile,
  objects,
}: GetBinaryLayersParameters) => {
  const tiles = getBinaryTiles({
    graphics,
    animations,
    mapFile,
    infFile,
    datFile,
    translateExits: true
  });

  const parse = parseJsonTile({ graphics, animations, objects });
  const parseJson = ({ layer, x, y }) => {
    const g = {};
    let tile = tiles[y][x];
    tile.graphics.forEach((v, i) => g[i + 1] = v);
    const jsonTile: JsonTile = {
      g,
      b: tile.blocked,
      t: tile.trigger,
      o: tile.object,
      n: tile.npc,
      te: tile.tileExit
    };

    return parse({ data: jsonTile, layer, x, y });
  };

  return mapLayers({ rows: tiles, process: parseJson });
};


export interface GetFlattenedTilesParameters {
  animations: Graphic[];
  datFile: string;
  graphics: JsonGraphicState;
  infFile: Uint8Array;
  mapFile: Uint8Array;
}

/**
 * Flattens binary formatted `Map` structure from `getBinaryLayers`
 */
export const getFlattenedBinaryTiles = ({
  animations,
  datFile,
  graphics,
  infFile,
  mapFile,
}: GetFlattenedTilesParameters) => {
  const tiles: LayeredTile[] = [];
  const rows = getBinaryTiles({
    animations,
    datFile,
    graphics,
    infFile,
    mapFile,
  });

  rows.forEach((cols = []) => {
    cols.forEach(tile => tile && tiles.push(tile));
  });

  return tiles;
};
