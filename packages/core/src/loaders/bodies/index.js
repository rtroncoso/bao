import Body from '@mob/core/src/models/data/character/Body';

import { parseDirectionAnimationByModel, transform } from '../util';

/**
 * Parses JSON bodies file into a key-value map
 * of body id's and their respective `Body`
 * models
 * @param data
 * @param animations
 * @returns {MapObject.<string, Body>}
 */
export const getBodies = (data, animations) => transform(data, parseDirectionAnimationByModel(animations, Body));

export default getBodies;
