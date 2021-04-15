import { parseDirectionGraphicByModel, transform } from '@mob/core/loaders';
import { Head } from '@mob/core/models';

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
