import { parseDirectionAnimationByModel, transform } from '@mob/core/loaders';
import { Body, Graphic } from '@mob/core/models';

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

/**
 * Parses JSON bodies file into a key-value map
 * of body id's and their respective `Body`
 */
export const getBodies = (data: JsonBodiesModel, animations: Graphic[]) => (
  transform(data, parseDirectionAnimationByModel(animations, Body))
);

export default getBodies;
