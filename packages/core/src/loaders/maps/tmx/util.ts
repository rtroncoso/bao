import isArray from 'lodash/fp/isArray';
import { TILE_SIZE, TILED_MAP_SIZE } from '@mob/core/src/constants/game/Map';
import { findInSpriteSheet } from '@mob/core/src/loaders/spritesheets';

/**
 * Obtains 1D array index for a given x, y coordinate
 * @param x
 * @param y
 * @param size
 * @returns {number}
 */
export const getIndex = (x, y, size = TILED_MAP_SIZE[0]) => y * size + x;

/**
 * Obtains 1D array index for a given x, y coordinate and tile size
 * @param x
 * @param y
 * @param size
 * @param tileSize
 * @returns {number}
 */
export const getTileIndex =
  (x, y, size = TILED_MAP_SIZE[0], tileSize = TILE_SIZE) => getIndex(x / tileSize, y / tileSize, size);

/**
 * Obtains a tiled property type from it's value
 * @param value
 * @returns {*}
 */
export const getPropertyType = (value) => {
  const stringTypes = ['string', 'boolean'];
  const convert = ['string', 'bool'];
  const index = stringTypes.indexOf(typeof value);

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'float';
  }

  if (index > -1) {
    return convert[index];
  }

  return convert[0];
};

/**
 * Converts property value to a given type
 * @param value
 * @param type
 * @returns {*}
 */
export const getValueForType = (value, type) => {
  const types = ['string', 'bool', 'int', 'float'];
  const convert = [String, Boolean, parseInt, parseFloat];
  const index = types.indexOf(type);

  if (index > -1) {
    return convert[index](value);
  }

  return convert[0](value);
};

/**
 * Creates and appends a property into a layer
 * @param layer
 * @param name
 * @param value
 */
export const createProperty = (layer, name, value) => {
  if (!isArray(layer && layer.properties)) {
    layer.props = layer.properties;
    layer.properties = [];
  }

  const type = getPropertyType(value);
  const property = { name, type, value };
  layer.properties.push(property);
  return layer;
};

/**
 * Sets or creates a property for a layer
 * @param layer
 * @param name
 * @param value
 */
export const setProperty = (layer, name, value) => {
  if (!isArray(layer && layer.properties)) return createProperty(layer, name, value);
  const property = layer.properties.find(l => l.name === name);

  if (property) {
    property.value = value;
  }

  return layer;
};

/**
 * Gets a property from a layer by property name
 * @param layer
 * @param name
 * @returns {Array|*}
 */
export const getProperty = (layer, name) => {
  const prop = layer.properties && layer.properties.find(p => p.name === name);
  return prop && prop.value;
};

/**
 * ySort for tmx layers
 * @param a
 * @param b
 * @returns {number}
 */
export const ySortLayers = (a, b) => {
  const yA = a.properties.layer + a.properties.y + a.properties.offsety;
  const yB = b.properties.layer + b.properties.y + b.properties.offsety;
  // const offsetYA = a.properties.layer === 4 ? 6 * TILE_SIZE + yA : yA;
  // const offsetYB = b.properties.layer === 4 ? 6 * TILE_SIZE + yB : yB;
  return (yA - yB) * -1;
};

/**
 * Searches given `tileSets` for a `graphic` model
 * @param graphic
 * @param tileSets
 * @param resources
 * @returns {{frame, id}|null}
 */
export const findInTileSets = ({ graphic, tileSets = [], resources = {} }) => {
  for (const tileSet of tileSets) {
    const spriteSheet = resources[tileSet.spriteSheetSource];

    if (spriteSheet) {
      const resource = findInSpriteSheet({ graphic, spriteSheet, resources, tileSet });
      if (resource) return resource;
    }
  }

  return null;
};
