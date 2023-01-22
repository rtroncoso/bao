import {
  ANIMATION_TYPE,
  COLLISION_TYPE,
  OBJECT_TYPE,
  SPRITE_TYPE,
  TILE_SIZE,
  TRIGGER_TYPE,
  WATER_TYPE
} from '@bao/core/constants/game/Map';
import { HIDDEN_OBJECTS } from '@bao/core/constants/game/Object';
import { createProperty, getProperty } from '@bao/core/loaders/maps/tmx/util';
import {
  GroupLayer,
  ImageLayer,
  ObjectLayer,
  TileLayer,

  GROUP_LAYER_TYPE,
  IMAGE_LAYER_TYPE,
  OBJECT_LAYER_TYPE,
  TILE_LAYER_TYPE,
  TmxObject,
  Tiled
} from '@bao/core/models';
import { createRectangle } from '@bao/core/util/physics';

import each from 'lodash/fp/each';
import filter from 'lodash/fp/filter';
import flatMap from 'lodash/fp/flatMap';
import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';

type LayerType = TileLayer & ObjectLayer & GroupLayer & ImageLayer;

/**
 * Groups all TMX layers in one array
 */
export const getFlattenedLayers = (layers: Array<LayerType>) => {
  const getLayers = flow(
    map((layer: LayerType) => layer && layer.layers),
    flatMap(identity)
  );

  return getLayers(layers);
};

/**
 * Groups all TMX layers in one array from tmx
 */
export const getFlattenedLayersFromTmx = (tmx: Tiled) => {
  if (tmx.layers.length > 0) {
    return getFlattenedLayers(tmx.layers);
  }

  return [];
};

/**
 * Filters TMX layers by a layer type
 */
export const getFilteredLayersFromTmx = ({ tmx, type, visible }: {
  tmx: Tiled,
  type: string,
  visible: boolean,
}) => {
  const layers = getFlattenedLayersFromTmx(tmx);
  const getLayers = flow(
    filter((layer: LayerType) => layer.type === type),
    filter((layer: LayerType) => layer.visible === visible),
  );

  return getLayers(layers);
};

export const getImageLayersFromTmx = (tmx: Tiled) => (
  getFilteredLayersFromTmx({ tmx, type: IMAGE_LAYER_TYPE, visible: true })
);
export const getGroupLayersFromTmx = (tmx: Tiled) => (
  getFilteredLayersFromTmx({ tmx, type: GROUP_LAYER_TYPE, visible: true })
);
export const getObjectLayersFromTmx = (tmx: Tiled) => (
  getFilteredLayersFromTmx({ tmx, type: OBJECT_LAYER_TYPE, visible: true })
);

/**
 * Parse and append `usedTileSets` property into tile layers from TMX
 */
export const getTileLayersFromTmx = (tmx: Tiled) => {
  const layers = getFilteredLayersFromTmx({ tmx, type: TILE_LAYER_TYPE, visible: true });
  const getTileLayers = flow(
    map((layer) => createProperty(layer, 'usedTileSets', [])),
    each((layer) => range(0, getProperty(layer, 'tileSets')).map(
      tileSetIndex => (
        getProperty(layer, 'usedTileSets')
          .push(getProperty(layer, `tileSet${tileSetIndex}`))
      )
    ))
  );

  return getTileLayers(layers);
};

export const getObjectsFrobaojectLayers = (layers: Array<LayerType>) => {
  const getObjectLayers = flow(
    flatMap((layer: LayerType) => layer.objects.filter(
      (object: TmxObject) => (
        object.type === OBJECT_TYPE &&
        HIDDEN_OBJECTS.indexOf(getProperty(object, 'type')) === -1
      )
    ))
  );

  return getObjectLayers(layers);
};

export const getSpritesFrobaojectLayers = (layers: Array<LayerType>) => {
  const getObjectLayers = flow(
    flatMap((layer: LayerType) => layer.objects.filter(
      object => object.type === SPRITE_TYPE || object.type === ANIMATION_TYPE
    ))
  );

  return getObjectLayers(layers);
};

export const getCollisionsFrobaojectLayers = (layers: Array<LayerType>) => {
  const getObjectLayers = flow(
    flatMap((layer: LayerType) => (
      layer.objects.filter(object => object.type === COLLISION_TYPE))
    ),
    map((object: TmxObject) => {
      const { width, height } = object;
      const x = (object.x + object.width / 2) - (TILE_SIZE / 2);
      const y = (object.y + object.height / 2) - (TILE_SIZE / 2);
      return createRectangle({ x, y, width, height });
    })
  );

  return getObjectLayers(layers);
};

export const getTriggersFrobaojectLayers = (layers: Array<LayerType>) => {
  const getObjectLayers = flow(
    flatMap((layer: LayerType) => layer.objects.filter(
      object => object.type === TRIGGER_TYPE)
    ),
  );

  return getObjectLayers(layers);
};

export const getWaterFrobaojectLayers = (layers: Array<LayerType>) => {
  const getObjectLayers = flow(
    flatMap((layer: LayerType) => layer.objects.filter(
      object => object.type === WATER_TYPE)
    ),
    // map(o => new Intersects.Polygon(o.polygon)),
  );

  return getObjectLayers(layers);
};
