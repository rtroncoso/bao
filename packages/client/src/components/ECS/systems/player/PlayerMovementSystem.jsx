import { withPixiApp } from '@inlet/react-pixi';

import Keys from 'core/constants/input/Keyboard';
import { withWorld } from 'ecs/World';
import { getKeyboardEntity } from 'ecs/systems/input/InputSystem';
import Physic, { RUNNING_SPEED, WALKING_SPEED } from 'ecs/components/physics/Physic';
import Controllable from 'ecs/components/character/Controllable';
import {
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
  SET_SPEED,
  STOP_MOVING
} from 'ecs/entities/character/Character';
import System from 'ecs/System';

class PlayerMovementSystem extends System {
  update(delta) {
    const { world } = this.props;
    const controllable = world.queryComponents([Controllable, Physic]);
    const input = getKeyboardEntity(world);

    if (!input) {
      return;
    }

    if (input.isKeyPressed(Keys.KEY_W)) {
      controllable.forEach(e => e.emit(MOVE_UP));
    }

    if (input.isKeyPressed(Keys.KEY_S)) {
      controllable.forEach(e => e.emit(MOVE_DOWN));
    }

    if (input.isKeyPressed(Keys.KEY_A)) {
      controllable.forEach(e => e.emit(MOVE_LEFT));
    }

    if (input.isKeyPressed(Keys.KEY_D)) {
      controllable.forEach(e => e.emit(MOVE_RIGHT));
    }

    if (input.isKeyPressed(Keys.SHIFT)) {
      controllable.forEach(e => e.isWalking() && e.emit(SET_SPEED, RUNNING_SPEED));
    }

    if (input.isKeyDown(Keys.SHIFT)) {
      controllable.forEach(e => e.isRunning() && e.emit(SET_SPEED, WALKING_SPEED));
    }

    if (input.isKeyDown(Keys.KEY_W) && input.isKeyDown(Keys.KEY_S) &&
        input.isKeyDown(Keys.KEY_A) && input.isKeyDown(Keys.KEY_D)) {
      controllable.forEach(e => e.isMoving() && e.emit(STOP_MOVING));
    }
  }
}

export default withWorld(withPixiApp(PlayerMovementSystem));
