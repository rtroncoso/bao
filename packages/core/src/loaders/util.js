import cappedTransform from 'lodash/fp/transform';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import values from 'lodash/fp/values';

import {
  EAST, HEADINGS, NORTH, SOUTH, WEST,
} from '@mob/core/constants/game/Game';

// TODO: FIXME
const config = {};

/**
 * Adds extension to fileName
 * @param fileName
 * @returns {string}
 */
export const getGraphicsFileName = fileName => `${fileName}.png`;

/**
 * Converts file name to absolute texture path
 * @param fileName
 * @returns {string}
 */
export const getGraphicsFilePath = fileName => `${config.texturePath}/${getGraphicsFileName(fileName)}`;

/**
 * Extrapolates from INI data `key` formatted using `keyFormat`
 * @param key
 * @param keyFormat
 * @returns {string}
 */
export const parseKey = (key = '', keyFormat = /[^0-9.]/g) => key.replace(keyFormat, '');

/**
 * Transforms a data array into a key-value map using
 * `process` strategy as a reducer
 * @param {Array.<*>} data
 * @param {function(*=, *, *=)} process
 * @returns {MapObject.<*, *>}
 */
export const transform = (data, process) => (
  cappedTransform.convert({ cap: false })(process, {})(data)
);

/**
 * Finds an animation by `id` property in an animations array
 * @param id
 * @param animations
 * @returns {Graphic}
 */
export const findAnimation = (animations, id) => (
  find(animation => animation.id === id)(animations)
);

/**
 * Finds a graphic by `id` property in a graphics object
 * @param id
 * @param graphics
 * @returns {Graphic}
 */
export const findGraphic = (graphics, id) => graphics[id];

/**
 * Finds a graphic by `fileName` property in a graphics object
 * @param fileName
 * @param graphics
 * @returns {Graphic}
 */
export const findGraphicsByFileName = (graphics, fileName) => (
  filter(graphic => graphic.fileName === fileName)(values(graphics))
);

// Default animation parsing order
export const defaultOrder = [NORTH, WEST, SOUTH, EAST].map(h => HEADINGS[h]);

/**
 * Given a map of `graphics` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `graphics` map. Provides a generator function
 * for use with the {@link transform} method
 *
 * @param graphics
 * @param model
 * @param [order]
 * @returns {function(*=, *, *=)}
 */
export const parseDirectionGraphicByModel = (
  (graphics, model, order = defaultOrder) => (
    (reducer = {}, props, id) => {
      const {
        up, left, down, right, ...data
      } = props;
      const [north, west, south, east] = order;

      return reducer[id] = new model({
        ...data,
        [north]: findGraphic(graphics, up),
        [west]: findGraphic(graphics, left),
        [south]: findGraphic(graphics, down),
        [east]: findGraphic(graphics, right),
      });
    }
  )
);

/**
 * Given an array of `animations` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `animations` array. Provides a generator
 * function for use with the {@link transform} method
 *
 * @param animations
 * @param model
 * @param [order]
 * @returns {function(*=, *, *=)}
 */
export const parseDirectionAnimationByModel = (
  (animations, model, order = defaultOrder) => (reducer = {}, props, id) => {
    const {
      up, left, down, right, ...data
    } = props;
    const [north, west, south, east] = order;

    return reducer[id] = new model({
      ...data,
      [north]: findAnimation(animations, up),
      [west]: findAnimation(animations, left),
      [south]: findAnimation(animations, down),
      [east]: findAnimation(animations, right),
    });
  }
);
