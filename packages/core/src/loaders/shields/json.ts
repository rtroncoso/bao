import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders/util';
import { Graphic, Shield } from '@mob/core/models';

export interface JsonShieldModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonShieldsModel = Array<number | JsonShieldModel>;

/**
 * Parses JSON shields file into a key-value map
 * of shield id's and their respective `Shield`
 * models
 */
export const getJsonShields = (data: JsonShieldsModel, animations: Graphic[]) => {
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  return transform(data, parseDirectionAnimationByModel(animations, Shield));
};
