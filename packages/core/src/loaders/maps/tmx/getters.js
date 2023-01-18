import {
  ANIMATION_TYPE,
  COLLISION_TYPE,
  OBJECT_TYPE,
  SPRITE_TYPE,
  TILE_SIZE,
  TRIGGER_TYPE,
  WATER_TYPE
} from '@mob/core/constants/game/Map';
import { HIDDEN_OBJECTS } from '@mob/core/constants/game/Object';
import { createProperty, getProperty } from '@mob/core/loaders/maps/tmx/util';
import { GROUP_LAYER_TYPE, IMAGE_LAYER_TYPE, OBJECT_LAYER_TYPE, TILE_LAYER_TYPE } from '@mob/core/models/data/map/Tiled';
import { createRectangle } from '@mob/core/util/physics';

import each from 'lodash/fp/each';
import filter from 'lodash/fp/filter';
import flatMap from 'lodash/fp/flatMap';
import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';

/**
 * Groups all TMX layers in one array
 * @param layers
 * @returns {Array.<TileLayer|ObjectLayer|GroupLayer|ImageLayer>}
 */
export const getFlattenedLayers = (layers) => {
  const getLayers = flow(
    map(layer => layer && layer.layers),
    flatMap(identity)
  );

  return getLayers(layers);
};

/**
 * Groups all TMX layers in one array from tmx
 * @param tmx
 * @returns {Array.<TileLayer|ObjectLayer|GroupLayer|ImageLayer>}
 */
export const getFlattenedLayersFromTmx = (tmx) => {
  if (tmx.layers.length > 0) {
    return getFlattenedLayers(tmx.layers);
  }

  return [];
};

/**
 * Filters TMX layers by a layer type
 * @param tmx
 * @param type
 * @param visible
 * @returns {Array.<TileLayer|ObjectLayer|GroupLayer|ImageLayer>}
 */
export const getFilteredLayersFromTmx = ({ tmx, type, visible }) => {
  const layers = getFlattenedLayersFromTmx(tmx);
  const getLayers = flow(
    filter(layer => layer.type === type),
    filter(layer => layer.visible === visible),
  );

  return getLayers(layers);
};

export const getImageLayersFromTmx = tmx => getFilteredLayersFromTmx({ tmx, type: IMAGE_LAYER_TYPE, visible: true });
export const getGroupLayersFromTmx = tmx => getFilteredLayersFromTmx({ tmx, type: GROUP_LAYER_TYPE, visible: true });
export const getObjectLayersFromTmx = tmx => getFilteredLayersFromTmx({ tmx, type: OBJECT_LAYER_TYPE, visible: true });

/**
 * Parse and append `usedTileSets` property into tile layers from TMX
 * @param tmx
 * @returns {Array.<TileLayer>}
 */
export const getTileLayersFromTmx = (tmx) => {
  const layers = getFilteredLayersFromTmx({ tmx, type: TILE_LAYER_TYPE, visible: true });
  const getTileLayers = flow(
    map(l => createProperty(l, 'usedTileSets', [])),
    each(l => range(0, getProperty(l, 'tileSets')).map(
      j => getProperty(l, 'usedTileSets').push(getProperty(l, `tileSet${j}`))
    ))
  );

  return getTileLayers(layers);
};

export const getObjectsFromObjectLayers = (layers) => {
  const getObjectLayers = flow(
    flatMap(l => l.objects.filter(
      o => o.type === OBJECT_TYPE && HIDDEN_OBJECTS.indexOf(getProperty(o, 'type')) === -1
    ))
  );

  return getObjectLayers(layers);
};

export const getSpritesFromObjectLayers = (layers) => {
  const getObjectLayers = flow(
    flatMap(l => l.objects.filter(
      a => a.type === SPRITE_TYPE || a.type === ANIMATION_TYPE
    ))
  );

  return getObjectLayers(layers);
};

export const getCollisionsFromObjectLayers = (layers) => {
  const getObjectLayers = flow(
    flatMap(l => l.objects.filter(o => o.type === COLLISION_TYPE)),
    map((o) => {
      const x = (o.x + o.width / 2) - (TILE_SIZE / 2);
      const y = (o.y + o.height / 2) - (TILE_SIZE / 2);
      const { width, height } = o;
      return createRectangle({ x, y, width, height });
    })
  );

  return getObjectLayers(layers);
};

export const getTriggersFromObjectLayers = (layers) => {
  const getObjectLayers = flow(
    flatMap(l => l.objects.filter(o => o.type === TRIGGER_TYPE)),
  );

  return getObjectLayers(layers);
};

export const getWaterFromObjectLayers = (layers) => {
  const getObjectLayers = flow(
    flatMap(l => l.objects.filter(w => w.type === WATER_TYPE)),
    // map(o => new Intersects.Polygon(o.polygon)),
  );

  return getObjectLayers(layers);
};

export default null;
