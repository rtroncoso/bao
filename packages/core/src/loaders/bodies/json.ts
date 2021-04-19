import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders';
import { Body, Graphic } from '@mob/core/models';
import reduce from 'lodash/fp/reduce';

export interface JsonBodyModel {
  down: number;
  headOffsetX: number;
  headOffsetY: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonBodiesModel = Array<number | JsonBodyModel>;

export interface ParseJsonBodyReducer {
  [key: string]: Body;
}

/**
 * Parses JSON bodies file into a key-value map
 * of body id's and their respective `Body`
 */
export const getJsonBodies = (data: JsonBodiesModel, animations: Graphic[]) => (
  {}// reduce<
  //   JsonBodiesModel,
  //   ParseJsonBodyReducer
  // >(
  //   parseDirectionAnimationByModel(animations, Body)
  // )(data)
);
