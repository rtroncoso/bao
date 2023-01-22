import { reduce } from 'lodash/fp';

import {
  JsonGraphicState,
  parseDirectionGraphicByModel
} from '@bao/core/loaders';
import { Helmet } from '@bao/core/models';

export interface JsonHelmetModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonHelmetsModel = Array<number | JsonHelmetModel>;

export interface JsonHelmetState {
  [key: string]: Helmet;
}

/**
 * Parses JSON helmets file into a key-value map
 * of helmet id's and their respective `Helmet`
 * models
 */
export const getJsonHelmets = (data: JsonHelmetsModel, graphics: JsonGraphicState) => (
  reduce<
    JsonHelmetsModel,
    JsonHelmetState
  >(
    parseDirectionGraphicByModel<
      JsonHelmetModel,
      JsonHelmetState
    >({ graphics, Model: Helmet }),
    {}
  )(data)
);
