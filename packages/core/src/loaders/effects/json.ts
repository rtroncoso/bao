import { findAnimation, transform } from '@mob/core/loaders/util';
import { Effect, Graphic } from '@mob/core/models';

export interface JsonEffectModel {
  animation?: string | number;
  id?: string | number;
  offsetX?: number;
  offsetY?: number;
}

export type JsonEffectsModel = Array<JsonEffectModel | number>;

/**
 * @see {@link parseDirectionAnimationByModel}
 */
export const parseEffectAnimation = (animations: Graphic[]) => (
  (state = {}, data: JsonEffectModel, id: string) => {
    const animation = findAnimation(animations, id);
    state[id] = new Effect({ ...data, animation });

    return state;
  }
);

/**
 * Parses JSON effects file into a key-value map
 * of effect id's and their respective `Effect`
 * models
 */
export const getJsonEffects = (data: JsonEffectsModel, animations: Graphic[]) => (
  transform(data, parseEffectAnimation(animations))
);
