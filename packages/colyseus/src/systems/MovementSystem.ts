import { Room } from 'colyseus';

import { CharacterState } from '@mob/server/schema/CharacterState';

export class MovementSystem {
  protected room: Room;
  protected speed: number = 64;

  constructor(room: Room) {
    this.room = room;
    this.room.setSimulationInterval(this.update);
  }

  public update = (deltaTime: number) => {
    const { state } = this.room;
    state.characters.forEach((character: CharacterState) => {
      const speed = this.speed * (1 / deltaTime);
      const isKeyPressed = (key: string) => character.inputs.indexOf(key) !== -1;

      const direction = {
        x: isKeyPressed('a') ? -1 : isKeyPressed('d') ? 1 : 0,
        y: isKeyPressed('w') ? -1 : isKeyPressed('s') ? 1 : 0
      };

      if (direction.x !== 0 || direction.y !== 0) {
        const length = Math.sqrt((direction.x * direction.x) + (direction.y * direction.y));
        const velocity = {
          x: speed * (direction.x / length),
          y: speed * (direction.y / length)
        };

        character.x += velocity.x;
        character.y += velocity.y;
      }
    })
  }
}
