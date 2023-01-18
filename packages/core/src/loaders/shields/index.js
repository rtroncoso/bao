import { EAST, HEADINGS, NORTH, SOUTH, WEST } from '@mob/core/constants/game/Game';
import Shield from '@mob/core/models/data/character/Shield';

import { parseDirectionAnimationByModel, transform } from '../util';

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
