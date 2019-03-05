import { withPixiApp } from '@inlet/react-pixi';
import React from 'react';

import Keyboard from 'ecs/components/input/Keyboard';
import Input from 'ecs/entities/input/Input';
import System from 'ecs/System';
import { withWorld } from 'ecs/World';

export const KEYBOARD_TAG = 'keyboard';
export const getKeyboardEntity = world => world.queryTag(KEYBOARD_TAG)[0];

class InputSystem extends System {
  componentDidMount() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    this.onKeyDown = this.onKeyDown.unbind();
    this.onKeyUp = this.onKeyUp.unbind();
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(key) {
    const input = getKeyboardEntity(this.props.world);

    if (input && !input.isKeyPressed(key.which)) {
      const { pressed } = input.keyboard;
      pressed.push(key.which);
    }
  }

  onKeyUp(key) {
    const input = getKeyboardEntity(this.props.world);

    if (input && input.isKeyPressed(key.which)) {
      const { pressed } = input.keyboard;
      const index = pressed.indexOf(key.which);
      pressed.splice(index, 1);
    }
  }

  render() {
    return (
      <Input tags={[KEYBOARD_TAG]} components={[Keyboard]} />
    );
  }
}

export default withPixiApp(withWorld(InputSystem));
