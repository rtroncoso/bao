import { findAnimation } from '@mob/core/loaders/util';
import { Effect, Graphic } from '@mob/core/models';
import reduce from 'lodash/fp/reduce';

export interface JsonEffectModel {
  animation?: string | number;
  id?: string | number;
  offsetX?: number;
  offsetY?: number;
}

export type JsonEffectsModel = Array<JsonEffectModel | number>;

export interface JsonEffectState {
  [key: string]: Effect;
}

/**
 * @see {@link parseDirectionAnimationByModel}
 */
export const parseEffectAnimation = (animations: Graphic[]) => (
  (state: JsonEffectState, data: JsonEffectModel) => {
    const animation = findAnimation({ animations, id: data.id });
    state[data.id] = new Effect({ ...data, animation });

    return state;
  }
);

/**
 * Parses JSON effects file into a key-value map
 * of effect id's and their respective `Effect`
 * models
 */
export const getJsonEffects = (data: JsonEffectsModel, animations: Graphic[]) => (
  reduce<
    JsonEffectsModel,
    JsonEffectState
  >(
    parseEffectAnimation(animations),
    {}
  )(data)
);
