import Effect from '@mob/core/src/models/data/Effect';
import { findAnimation, transform } from '../util';

/**
 * @see {@link parseDirectionAnimationByModel}
 * @param animations
 * @returns {function(*=, *, *=)}
 */
export const parseEffectAnimation = animations => (reducer = {}, data, id) => {
  const animation = findAnimation(animations, id);
  return reducer[id] = new Effect({ ...data, animation });
};

/**
 * Parses JSON effects file into a key-value map
 * of effect id's and their respective `Effect`
 * models
 * @param data
 * @param animations
 * @returns {MapObject.<string, Effect>}
 */
export const getEffects = (data, animations) => transform(data, parseEffectAnimation(animations));

export default getEffects;
