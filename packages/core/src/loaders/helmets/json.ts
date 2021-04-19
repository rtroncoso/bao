import { parseDirectionGraphicByModel, transform } from '@mob/core/loaders';
import { Graphic, Helmet } from '@mob/core/models';

export interface JsonHelmetModel {
  down: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type JsonHelmetsModel = Array<number | JsonHelmetModel>;

/**
 * Parses JSON helmets file into a key-value map
 * of helmet id's and their respective `Helmet`
 * models
 */
export const getJsonHelmets = (data: JsonHelmetModel, graphics: Graphic[]) => (
  transform(data, parseDirectionGraphicByModel(graphics, Helmet))
);
