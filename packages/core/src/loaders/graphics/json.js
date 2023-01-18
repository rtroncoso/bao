import Graphic, { TexturedGraphic } from '@mob/core/models/data/Graphic';

import { getGraphicsFilePath, transform } from '../util';

/**
 * Create a `Graphic` model instance from props and
 * add it to a reducer object for self-referencing
 * animations
 * @param reducer
 * @param data
 * @param id
 * @returns {Graphic}
 */
export const parseGraphic = (reducer = {}, data, id) => {
  const { frames: animations = [], fileName } = data;

  if (animations.length > 0) {
    const frames = animations.map(frame => reducer[frame]);
    const speed = data.speed / 1800;
    return reducer[id] = new Graphic({ ...data, speed, frames });
  }

  const path = getGraphicsFilePath(fileName);
  return reducer[id] = new Graphic({ ...data, path });
};

/**
 * Parses JSON graphics file into a key-value map
 * of graphic id's and their respective `Graphic`
 * models
 * @param data
 * @returns {Object.<string, Graphic>}
 */
export const getGraphics = data => transform(data, parseGraphic);

export default getGraphics;
