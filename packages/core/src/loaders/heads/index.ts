import Head from '@mob/core/src/models/data/character/Head';

import { parseDirectionGraphicByModel, transform } from '../util';

/**
 * Parses JSON heads file into a key-value map
 * of head id's and their respective `Head`
 * models
 * @param data
 * @param graphics
 * @returns {MapObject.<string, Head>}
 */
export const getHeads = (data, graphics) => transform(data, parseDirectionGraphicByModel(graphics, Head));

export default getHeads;
