import Graphic, { TexturedGraphic } from '@mob/core/src/models/data/Graphic';

import map from 'lodash/fp/map';
import mapKeys from 'lodash/fp/mapKeys';
import transform from 'lodash/fp/transform';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';

import { getGraphicsFilePath, parseKey } from '../util';

/**
 * Parses animation frames by getting `Graphic` model
 * reference from the `reducer`
 * @param reducer
 * @returns {map}
 */
export const parseAnimations = reducer => (
  map(graphic => reducer[graphic])
);

/**
 * Argentum GRH INI Parsing format:
 *
 *    Static GRH:
 *      `{numFrames}-{fileName}-{x}-{y}-{width}-{height}`
 *    Animation:
 *      `{numFrames}-{grh1}-{grh2}-{grh3}-...-{grhN}-{speed}`
 *
 * @param reducer
 * @param graphicsString
 * @param id
 * @returns {Graphic}
 */
export const parseGraphic = (reducer = {}, graphicsString, id) => {
  const props = graphicsString.split('-');
  const numFrames = parseInt(props.shift(), 10);

  if (numFrames > 1) {
    const speed = props.pop() / 1800;
    const frames = parseAnimations(reducer)(props);
    return reducer[id] = new TexturedGraphic({
      id,
      frames,
      speed,
    });
  }

  const [fileName, x, y, width, height] = props;
  const path = getGraphicsFilePath(fileName);

  return reducer[id] = new TexturedGraphic({
    id,
    path,
    fileName,
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10)
  });
};

/**
 * Parses INI graphics file `file` into a key-value
 * map of graphic id's and their respective `Graphic`
 * models
 * @param file
 * @param key
 * @returns {MapObject.<string, Graphic>}
 */
export const getGraphics = (file, key = 'Graphics') => {
  const data = get(key, file);
  const uncappedTransform = transform.convert({ cap: false });

  return flow(
    mapKeys(parseKey),
    uncappedTransform(parseGraphic, {})
  )(data);
};

export default getGraphics;
