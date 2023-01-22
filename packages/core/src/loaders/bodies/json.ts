import { DirectionAnimationData, parseDirectionAnimationByModel } from '@bao/core/loaders';
import { Body, Graphic } from '@bao/core/models';
import reduce from 'lodash/fp/reduce';

export interface JsonBodyModel extends DirectionAnimationData {
  down: string | number;
  headOffsetX: number;
  headOffsetY: number;
  id: string | number;
  left: string | number;
  right: string | number;
  up: string | number;
}

export type JsonBodiesModel = Array<number | JsonBodyModel>;

export interface JsonBodyState {
  [key: string]: Body;
}

/**
 * Parses JSON bodies file into a key-value map
 * of body id's and their respective `Body`
 */
export const getJsonBodies = (data: JsonBodiesModel, animations: Graphic[]) => (
  reduce<
    JsonBodiesModel,
    JsonBodyState
  >(
    parseDirectionAnimationByModel<
      JsonBodyModel,
      JsonBodyState
    >({ animations, Model: Body }),
    {}
  )(data)
);
