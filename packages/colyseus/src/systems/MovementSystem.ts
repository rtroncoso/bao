import { Room } from 'colyseus';

import { Heading, TILE_SIZE } from '@mob/core';
import { CharacterState } from '@mob/server/schema/CharacterState';
import { TilePosition } from '@/schema/MapState';

export class MovementSystem {
  protected room: Room;
  protected speed = 64;

  constructor(room: Room) {
    this.room = room;
    this.room.setSimulationInterval(this.update);
  }

  private getCharacterHeading(key: string) {
    return key === 's'
      ? Heading.SOUTH
      : key === 'd'
      ? Heading.EAST
      : key === 'w'
      ? Heading.NORTH
      : key === 'a'
      ? Heading.WEST
      : null;
  }

  private getCharacterDirection(heading: Heading) {
    return {
      x: heading === Heading.WEST ? -1 : heading === Heading.EAST ? 1 : 0,
      y: heading === Heading.NORTH ? -1 : heading === Heading.SOUTH ? 1 : 0
    };
  }

  public update = (deltaTime: number) => {
    const { state } = this.room;
    state.characters.forEach((character: CharacterState) => {
      const speed = this.speed * (1 / deltaTime);
      const inputs = character.inputs.filter((key) =>
        ['a', 'd', 'w', 's'].includes(key)
      );

      if (inputs.length && !character.isMoving) {
        const [key] = inputs;
        const heading: Heading = this.getCharacterHeading(key);
        const direction = this.getCharacterDirection(heading);

        character.isMoving = true;
        character.heading = heading;
        character.targetTile = new TilePosition({
          x: character.tile.x + direction.x,
          y: character.tile.y + direction.y
        });
      }

      if (character.isMoving) {
        const direction = this.getCharacterDirection(character.heading);
        const velocity = {
          x: speed * direction.x,
          y: speed * direction.y
        };

        character.x += velocity.x;
        character.y += velocity.y;
      }

      if (character.tile.x !== Math.floor(character.x / TILE_SIZE)) {
        character.tile.x = Math.floor(character.x / TILE_SIZE);
      }

      if (character.tile.y !== Math.floor(character.y / TILE_SIZE)) {
        character.tile.y = Math.floor(character.y / TILE_SIZE);
      }

      if (
        character.isMoving &&
        character.heading === Heading.SOUTH &&
        character.y >= character.targetTile.y * TILE_SIZE
      ) {
        character.y = Math.floor(character.targetTile.y * TILE_SIZE);
        character.isMoving = false;
        character.targetTile = null;
      }
      if (
        character.isMoving &&
        character.heading === Heading.EAST &&
        character.x >= character.targetTile.x * TILE_SIZE
      ) {
        character.x = Math.floor(character.targetTile.x * TILE_SIZE);
        character.isMoving = false;
        character.targetTile = null;
      }

      if (
        character.isMoving &&
        character.heading === Heading.NORTH &&
        character.y <= character.targetTile.y * TILE_SIZE
      ) {
        character.y = Math.floor(character.targetTile.y * TILE_SIZE);
        character.isMoving = false;
        character.targetTile = null;
      }

      if (
        character.isMoving &&
        character.heading === Heading.WEST &&
        character.x <= character.targetTile.x * TILE_SIZE
      ) {
        character.x = Math.floor(character.targetTile.x * TILE_SIZE);
        character.isMoving = false;
        character.targetTile = null;
      }
    });
  };
}
