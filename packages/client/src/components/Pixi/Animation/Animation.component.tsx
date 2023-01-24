import { Graphic } from '@bao/core';
import { PixiComponent } from '@inlet/react-pixi';
import { AnimatedSprite, Resource, Texture } from 'pixi.js';

export interface AnimationProps {
  animation?: Graphic;
  animationSpeed?: number;
  alpha?: number;
  textures?: Texture<Resource>[];
  x?: number;
  y?: number;
}

export const Animation = PixiComponent<AnimationProps, AnimatedSprite>(
  'Animation',
  {
    create: ({ animation, textures }) => {
      const instance = new AnimatedSprite(textures || animation.textures, true);
      return instance;
    },

    applyProps: (instance, oldProps, newProps) => {
      const {
        animationSpeed = 0.2,
        alpha = 1,
        animation,
        textures,
        x,
        y
      } = newProps;

      if (textures !== oldProps.textures) {
        instance.textures = textures;
      }

      if (animation !== oldProps.animation) {
        instance.textures = animation.textures;
      }

      instance.animationSpeed = animation ? animation.speed : animationSpeed;
      instance.alpha = alpha;
      instance.position.set(x, y);
      return instance;
    }
  }
);
