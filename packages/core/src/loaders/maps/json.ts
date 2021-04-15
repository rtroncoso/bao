import head from 'lodash/fp/head';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';
import values from 'lodash/fp/values';
import _ from 'lodash';

import {
  COLLISION_LAYER,
  MAP_LAYERS,
  NPC_LAYER,
  OBJECT_LAYER,
  TILE_EXIT_LAYER,
  TRIGGER_LAYER,
} from '@mob/core/constants/game/Map';
import { getDimensions } from '@mob/core/loaders/graphics';
import { findAnimation, findGraphic } from '@mob/core/loaders/util';
import { Graphic, MapObject, Tile } from '@mob/core/models';

export interface JsonTile {
  [key: string]: any;
}

export interface ParseJsonTileWrapperParameters {
  animations: Graphic[];
  graphics: Graphic[];
  objects: MapObject[];
}

export interface ParseJsonTileParameters<InputType> {
  data: InputType;
  layer: number;
  x: number;
  y: number;
}

export type ParseJsonTile<K, O> = (params: ParseJsonTileParameters<K>) => O;
export type ParseJsonTileWrapper<K, O> = (params: ParseJsonTileWrapperParameters) => (
  ParseJsonTile<K, O>
);

/**
 * Parses `Tile` model from `data` object
 */
export const parseJsonTile: ParseJsonTileWrapper<JsonTile, Tile> = ({
  animations,
  graphics,
  objects,
}: ParseJsonTileWrapperParameters) => ({
  data,
  layer,
  x,
  y
}: ParseJsonTileParameters<JsonTile>) => {
  const { g } = data;
  let graphic = findGraphic(graphics, g[layer]);
  let dimensions = null;
  let animation = null;
  let trigger = null;
  let blocked = null;
  let tileExit = null;
  let object = null;
  let npc = null;

  if (graphic) {
    if (graphic.frames.length > 0) {
      animation = findAnimation(animations, g[layer]);
      graphic = _.get(animation, 'frames.0');
    }

    dimensions = getDimensions(graphic);
  }

  if (data.o && layer === OBJECT_LAYER) {
    object = _.get(data, 'o');
    const { graphic, type } = objects.find(o => o.id === object.id);
    if (graphic) {
      object.graphic = graphic;
      object.type = type;

      if (graphic.frames.length === 0) {
        dimensions = getDimensions(graphic);
      }
    }
  }

  if (data.n && layer === NPC_LAYER) npc = _.get(data, 'n');
  if (data.te && layer === TILE_EXIT_LAYER) tileExit = _.get(data, 'te');
  if (data.b && layer === COLLISION_LAYER) blocked = _.get(data, 'b');
  if (data.t && layer === TRIGGER_LAYER) trigger = _.get(data, 't');

  if (npc || object || graphic || animation || blocked || tileExit || trigger) {
    return new Tile({
      ...dimensions,
      animation,
      graphic,
      blocked,
      tileExit,
      trigger,
      object,
      layer,
      npc,
      x,
      y,
    });
  }

  return null;
};

export interface MapLayersParameters {
  rows: JsonTile[][];
  process: ParseJsonTile<JsonTile, Tile>;
}

/**
 * Maps layers from JSON format and creates `Tile` model
 * structures
 */
export const mapLayers = ({ rows, process }) => (
  range(1, MAP_LAYERS + 1).map(
    (layer: number) => {
      let y = -1;
      return map((cols: JsonTile[]) => {
        let x = -1;
        y++;
        return map((data: JsonTile) => {
          x++;
          return process({ data, layer, x, y });
        })(cols);
      })(rows);
    }
  )
);

/**
 * Parses JSON formatted `Map` structure from file
 */
export const getJsonLayers = ({
  animations,
  graphics,
  mapFile,
  objects,
}) => {
  const layerData = head(values(mapFile));
  return mapLayers({
    process: parseJsonTile({ graphics, animations, objects }),
    rows: layerData,
  });
};

/**
 * Flattens JSON formatted `Map` structure from `getMapLayers`
 */
export const getFlattenedJsonTiles = ({
  animations,
  graphics,
  mapFile,
  objects,
}) => {
  const tiles = [];
  const layers = getJsonLayers({
    animations,
    graphics,
    mapFile,
    objects
  });

  layers.forEach((rows) => {
    rows.forEach((cols) => {
      cols.forEach(tile => tile && tiles.push(tile));
    });
  });

  return tiles;
};
