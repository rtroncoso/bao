import { Heading, TILE_SIZE } from '@mob/core';
import { CharacterState } from '@mob/server/schema/CharacterState';
import { TilePosition } from '@/schema/MapState';
import { WorldRoom } from 'src/rooms/WorldRoom';

export class MovementSystem {
  protected room: WorldRoom;
  protected blockedTiles: Array<[string, TilePosition]> = [];

  constructor(room: WorldRoom) {
    this.room = room;
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

  private isTileBlocked(tile: TilePosition, excludeSessionId?: string) {
    return this.blockedTiles.some(
      ([sessionId, blockedTile]) =>
        sessionId !== excludeSessionId &&
        blockedTile.x === tile.x &&
        blockedTile.y === tile.y
    );
  }

  private findBlockedTileIndex(tile: TilePosition, excludeSessionId?: string) {
    return this.blockedTiles.findIndex(
      ([sessionId, blockedTile]) =>
        sessionId !== excludeSessionId &&
        blockedTile.x === tile.x &&
        blockedTile.y === tile.y
    );
  }

  private handleStopMovement(character: CharacterState) {
    const stopMovement = () => {
      if (this.isTileBlocked(character.targetTile, character.sessionId)) {
        character.x = character.tile.x * TILE_SIZE;
        character.y = character.tile.y * TILE_SIZE;
        character.isMoving = false;
        character.targetTile = null;
        return;
      }

      character.x = character.targetTile.x * TILE_SIZE;
      character.y = character.targetTile.y * TILE_SIZE;
      character.isMoving = false;
      character.targetTile = null;

      const index = this.findBlockedTileIndex(
        character.tile,
        character.sessionId
      );
      if (index) this.blockedTiles.splice(index);
    };

    if (
      character.isMoving &&
      character.heading === Heading.SOUTH &&
      character.y >= character.targetTile.y * TILE_SIZE
    ) {
      stopMovement();
    }
    if (
      character.isMoving &&
      character.heading === Heading.EAST &&
      character.x >= character.targetTile.x * TILE_SIZE
    ) {
      stopMovement();
    }

    if (
      character.isMoving &&
      character.heading === Heading.NORTH &&
      character.y <= character.targetTile.y * TILE_SIZE
    ) {
      stopMovement();
    }

    if (
      character.isMoving &&
      character.heading === Heading.WEST &&
      character.x <= character.targetTile.x * TILE_SIZE
    ) {
      stopMovement();
    }
  }

  public update(deltaTime: number) {
    const { state } = this.room;
    state.characters.forEach((character: CharacterState) => {
      const speed = character.speed * (1 / deltaTime);
      const inputs = character.inputs.filter((key) =>
        ['a', 'd', 'w', 's'].includes(key)
      );

      if (inputs.length && !character.isMoving) {
        const [key] = inputs;
        const heading: Heading = this.getCharacterHeading(key);
        const direction = this.getCharacterDirection(heading);
        const targetTile = new TilePosition({
          x: character.tile.x + direction.x,
          y: character.tile.y + direction.y
        });

        character.heading = heading;
        if (!this.isTileBlocked(targetTile)) {
          character.isMoving = true;
          character.targetTile = targetTile;
        }
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

      this.handleStopMovement(character);

      if (character.tile.x !== Math.floor(character.x / TILE_SIZE)) {
        character.tile.x = Math.floor(character.x / TILE_SIZE);
        this.blockedTiles.push([character.sessionId, character.tile]);
      }

      if (character.tile.y !== Math.floor(character.y / TILE_SIZE)) {
        character.tile.y = Math.floor(character.y / TILE_SIZE);
        this.blockedTiles.push([character.sessionId, character.tile]);
      }
    });
  }
}
