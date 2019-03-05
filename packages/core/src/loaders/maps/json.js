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
} from '@mob/core/src/constants/game/Map';
import { getDimensions } from '@mob/core/src/loaders/graphics';
import { findAnimation, findGraphic } from '@mob/core/src/loaders/util';
import Tile from '@mob/core/src/models/data/map/Tile';

/**
 * Parses `Tile` model from `data` object
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Array.<MapObject>} objects
 * @returns {function(d, l, x, y): Tile}
 */
export const parseTile = (graphics, animations, objects) => (data, layer, x, y) => {
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
    const { graphicId, type } = objects.find(o => o.id === object.id);
    if (graphicId) {
      const objectGraphic = findGraphic(graphics, graphicId);
      object.graphic = objectGraphic;
      object.type = type;

      if (objectGraphic.frames.length === 0) {
        dimensions = getDimensions(objectGraphic);
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

/**
 * Maps layers from JSON format and creates `Tile` model
 * structures
 * @param row
 * @param process
 * @returns {Array.<Array.<Array.<Tile>>>}
 */
export const mapLayers = (row, process) => range(1, MAP_LAYERS + 1).map(
  (l) => {
    let y = -1;
    return map((col) => {
      let x = -1;
      y++;
      return map((d) => { x++; return process(d, l, x, y); })(col);
    })(row);
  }
);

/**
 * Parses JSON formatted `Map` structure from file
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Array.<MapObject>} objects
 * @param mapFile
 * @returns {Array.<Array.<Array.<Tile>>>}
 */
export const getMapLayers = (graphics, animations, objects, mapFile) => {
  const layerData = head(values(mapFile));
  return mapLayers(layerData, parseTile(graphics, animations, objects));
};

/**
 * Flattens JSON formatted `Map` structure from `getMapLayers`
 * @param {Array.<number|Graphic>} graphics
 * @param {Array.<Graphic>} animations
 * @param {Array.<MapObject>} objects
 * @param mapFile
 * @returns {Array.<Tile>}
 */
export const getFlattenedTiles = (graphics, animations, objects, mapFile) => {
  const tiles = [];
  const layers = getMapLayers(graphics, animations, objects, mapFile);
  layers.forEach((rows) => {
    rows.forEach((cols) => {
      cols.forEach(tile => tile && tiles.push(tile));
    });
  });
  return tiles;
};

export default getMapLayers;
