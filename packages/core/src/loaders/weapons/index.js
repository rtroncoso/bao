import { HEADINGS, EAST, NORTH, SOUTH, WEST } from '@mob/core/src/constants/game/Game';
import { parseDirectionAnimationByModel, transform } from '@mob/core/src/loaders/util';
import Weapon from '@mob/core/src/models/data/character/Weapon';

/**
 * Parses JSON weapons file into a key-value map
 * of weapon id's and their respective `Weapon`
 * models
 * @param data
 * @param animations
 * @returns {MapObject.<string, Weapon>}
 */
export const getWeapons = (data, animations) => {
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  return transform(data, parseDirectionAnimationByModel(animations, Weapon));
};

export default getWeapons;
