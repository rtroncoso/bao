import { HEADINGS, EAST, NORTH, SOUTH, WEST } from '@mob/core/constants/game/Game';
import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders';
import { Weapon } from '@mob/core/models';

/**
 * Parses JSON weapons file into a key-value map
 * of weapon id's and their respective `Weapon`
 * models
 */
export const getWeapons = (data, animations) => {
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  return transform(data, parseDirectionAnimationByModel(animations, Weapon));
};

export default getWeapons;
