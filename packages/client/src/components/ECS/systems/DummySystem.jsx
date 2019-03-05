import { withPixiApp } from '@inlet/react-pixi';

import {
  HIT,
  SET_BODY, SET_HEAD, SET_HELMET, SET_SHIELD, SET_WEAPON
} from 'ecs/entities/character/Character';
import Controllable from 'ecs/components/character/Controllable';
import Gear, {
  BODY, HEAD, HELMET, SHIELD, WEAPON
} from 'ecs/components/character/Gear';
import Health from 'ecs/components/character/Health';
import System from 'ecs/System';
import { getKeyboardEntity } from 'ecs/systems/input/InputSystem';
import { withWorld } from 'ecs/World';
import Keys from 'core/constants/input/Keyboard';

class DummySystem extends System {
  constructor(props) {
    super(props);
    this.gearParts = [
      { action: SET_BODY, key: BODY, data: props.bodies },
      { action: SET_HEAD, key: HEAD, data: props.heads },
      { action: SET_WEAPON, key: WEAPON, data: props.weapons },
      { action: SET_SHIELD, key: SHIELD, data: props.shields },
      { action: SET_HELMET, key: HELMET, data: props.helmets },
    ];

    ([this.currentGear] = this.gearParts);
  }

  update(delta) {
    const { world, bodies } = this.props;
    const entities = world.queryComponents([Health]);
    const input = getKeyboardEntity(world);

    if (input && input.isKeyPressed(Keys.SPACE)) {
      entities.forEach(e => e.emit(HIT, 0.1));
    }

    if (!this.adding && input && input.isKeyPressed(Keys.ADD)) {
      const candidates = world.queryComponents([Controllable, Gear]);
      candidates.forEach((e) => {
        const next = e.gear[this.currentGear.key] || { id: 0 };
        if (next.id < 0) next.id = e.gear[this.currentGear.key].length;
        if (next.id > e.gear[this.currentGear.key].length) next.id = 0;
        if (next) e.emit(this.currentGear.action, this.currentGear.data[next.id + 1]);
      });

      this.adding = true;
      setTimeout(() => this.adding = false, 100);
    }

    if (!this.subtracting && input && input.isKeyPressed(Keys.SUBTRACT)) {
      const candidates = world.queryComponents([Controllable, Gear]);
      candidates.forEach((e) => {
        const next = e.gear[this.currentGear.key] || { id: 0 };
        if (next.id < 0) next.id = e.gear[this.currentGear.key].length;
        if (next.id > e.gear[this.currentGear.key].length) next.id = 0;
        if (next) e.emit(this.currentGear.action, this.currentGear.data[next.id - 1]);
      });

      this.subtracting = true;
      setTimeout(() => this.subtracting = false, 100);
    }

    if (!this.changing && input && input.isKeyPressed(Keys.SPACE)) {
      let next = this.gearParts.indexOf(this.currentGear) + 1;
      if (next >= this.gearParts.length) next = 0;
      this.currentGear = this.gearParts[next];
      console.log(`changing gear: ${this.currentGear.key}`);

      this.changing = true;
      setTimeout(() => this.changing = false, 100);
    }
  }
}

export default withWorld(withPixiApp(DummySystem));
