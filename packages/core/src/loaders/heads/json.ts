import { parseDirectionGraphicByModel, transform } from '@mob/core/loaders';
import { Graphic, Head } from '@mob/core/models';

export interface JsonHeadModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonHeadsModel = Array<number | JsonHeadModel>;

/**
 * Parses JSON heads file into a key-value map
 * of head id's and their respective `Head`
 * models
 */
export const getJsonHeads = (data: JsonHeadsModel, graphics: Graphic[]) => (
  transform(data, parseDirectionGraphicByModel(graphics, Head))
);
