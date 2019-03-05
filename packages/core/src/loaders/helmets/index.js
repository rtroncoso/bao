import Helmet from '@mob/core/src/models/data/character/Helmet';

import { parseDirectionGraphicByModel, transform } from '../util';

/**
 * Parses JSON helmets file into a key-value map
 * of helmet id's and their respective `Helmet`
 * models
 * @param data
 * @param graphics
 * @returns {MapObject.<string, Helmet>}
 */
export const getHelmets = (data, graphics) => transform(data, parseDirectionGraphicByModel(graphics, Helmet));

export default getHelmets;
