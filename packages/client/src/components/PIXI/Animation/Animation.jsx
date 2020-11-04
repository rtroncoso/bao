import { PixiComponent } from '@inlet/react-pixi';
import { extras } from 'pixi.js';

export const ANIMATION = 'Animation';

export const behavior = {
  create: ({ animation, textures, ...props }) => {
    const instance = new extras.AnimatedSprite(textures || animation.textures, true);
    instance.animation = animation;

    return instance;
  },

  /**
   * @param {extras.AnimatedSprite} instance
   * @param oldProps
   * @param newProps
   */
  applyProps: (instance, oldProps, newProps) => {
    const {
      animationSpeed = 0.1,
      alpha = 1,
      animation,
      textures,
      x,
      y,
    } = newProps;

    if (textures !== oldProps.textures) {
      instance.textures = textures;
    }

    if (animation !== oldProps.animation) {
      instance.textures = animation.textures;
      instance.animation = animation;
    }

    instance.animationSpeed = animation ? animation.speed : animationSpeed;
    instance.alpha = alpha;
    instance.position.set(x, y);
    return instance;
  }
};

export default PixiComponent(ANIMATION, behavior);
