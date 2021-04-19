// import { HEADINGS, EAST, NORTH, SOUTH, WEST } from '@mob/core/constants/game/Game';
import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders';
import { Graphic, Weapon } from '@mob/core/models';

export interface JsonWeaponModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonWeaponsModel = Array<number | JsonWeaponModel>;

/**
 * Parses JSON weapons file into a key-value map
 * of weapon id's and their respective `Weapon`
 * models
 */
export const getJsonWeapons = (data: JsonWeaponsModel, animations: Graphic[]) => (
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  transform(data, parseDirectionAnimationByModel(animations, Weapon))
);
