import reduce from 'lodash/fp/reduce';
import { parseDirectionAnimationByModel } from '@bao/core/loaders/util';
import { Graphic, Shield } from '@bao/core/models';

export interface JsonShieldModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonShieldsModel = Array<number | JsonShieldModel>;

export interface JsonShieldState {
  [key: string]: Shield
}

/**
 * Parses JSON shields file into a key-value map
 * of shield id's and their respective `Shield`
 * models
 */
export const getJsonShields = (data: JsonShieldsModel, animations: Graphic[]) => {
  // const order = [EAST, SOUTH, NORTH, WEST].map(h => HEADINGS[h]);
  return reduce<
    JsonShieldsModel,
    JsonShieldState
  >(
    parseDirectionAnimationByModel<
      JsonShieldModel,
      JsonShieldState
    >({ animations, Model: Shield }),
    {}
  )(data);
};
