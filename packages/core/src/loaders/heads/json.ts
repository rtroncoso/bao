import reduce from 'lodash/fp/reduce';

import {
  DirectionGraphicData,
  JsonGraphicState,
  parseDirectionGraphicByModel
} from '@mob/core/loaders';
import { Head } from '@mob/core/models';

export interface JsonHeadModel extends DirectionGraphicData {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonHeadsModel = Array<number | JsonHeadModel>;

export interface JsonHeadState {
  [key: string]: Head;
}

/**
 * Parses JSON heads file into a key-value map
 * of head id's and their respective `Head`
 * models
 */
export const getJsonHeads = (data: JsonHeadsModel, graphics: JsonGraphicState) => (
  reduce<
    JsonHeadsModel,
    JsonHeadState
  >(
    parseDirectionGraphicByModel<
      JsonHeadModel,
      JsonHeadState
    >({ graphics, Model: Head }),
    {}
  )(data)
);
