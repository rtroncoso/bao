import Entity from 'ecs/Entity';
import { withWorld } from 'ecs/World';

class Input extends Entity {
  componentDidMount() {
    this.entity.isKeyPressed = this.isKeyPressed.bind(this);
    this.entity.isKeyDown = this.isKeyDown.bind(this);
  }

  isKeyPressed(key) {
    const { pressed = [] } = this.entity.keyboard;
    return pressed.indexOf(key) > -1;
  }

  isKeyDown(key) {
    return !this.isKeyPressed(key);
  }
}

export default withWorld(Input);
