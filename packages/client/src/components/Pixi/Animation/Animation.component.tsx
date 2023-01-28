import { getTexture, Graphic } from '@bao/core';
import { PixiComponent } from '@inlet/react-pixi';
import { AnimatedSprite, Resource, Texture } from 'pixi.js';

export interface AnimationProps {
  animation?: number | Graphic;
  animationSpeed?: number;
  alpha?: number;
  loop?: boolean;
  textures?: Texture<Resource>[];
  x?: number;
  y?: number;
}

export const Animation = PixiComponent<AnimationProps, AnimatedSprite>(
  'Animation',
  {
    create: ({ animation, loop = true, textures }) => {
      if (
        animation &&
        animation instanceof Graphic &&
        !animation.textures.length
      ) {
        textures = animation.frames.map((frame) => getTexture(frame));
        const instance = new AnimatedSprite(textures, true);
        instance.animationSpeed = animation.speed;
        instance.loop = loop;
        return instance;
      }

      const instance = new AnimatedSprite(textures, true);
      return instance;
    },

    applyProps: (instance, oldProps, newProps) => {
      const {
        animationSpeed = 0.2,
        alpha = 1,
        animation,
        loop = true,
        textures,
        x,
        y
      } = newProps;

      if (textures !== oldProps.textures) {
        instance.textures = textures;
      }

      if (animation !== oldProps.animation && animation instanceof Graphic) {
        instance.textures = animation.frames.map((frame) => getTexture(frame));
      }

      instance.animationSpeed =
        animation && animation instanceof Graphic
          ? animation.speed
          : animationSpeed;
      instance.alpha = alpha;
      instance.position.set(x, y);
      instance.loop = loop;

      return instance;
    }
  }
);
