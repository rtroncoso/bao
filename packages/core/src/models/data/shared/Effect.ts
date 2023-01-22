import { Graphic } from '@bao/core/models';

export interface EffectModelConstructor {
  animation?: Graphic | number;
  id?: string | number;
  offsetX?: number;
  offsetY?: number;
}

/**
 * Effect model
 */
export class Effect {
  id: string | number;
  animation: Graphic | number;
  offsetX: number;
  offsetY: number;

  constructor({
    id = 0,
    animation = 0,
    offsetX = 0,
    offsetY = 0
  }: EffectModelConstructor) {
    this.id = id;
    this.animation = animation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
}
