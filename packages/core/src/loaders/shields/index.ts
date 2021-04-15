import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders';
import { Shield } from '@mob/core/models';

/**
 * Parses JSON shields file into a key-value map
 * of shield id's and their respective `Shield`
 * models
 * @param data
 * @param animations
 * @returns {MapObject.<string, Shield>}
 */
export const getShields = (data, animations) => {
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  return transform(data, parseDirectionAnimationByModel(animations, Shield));
};

export default getShields;
