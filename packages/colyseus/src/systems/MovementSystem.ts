import { Heading, TILE_SIZE } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { TilePosition } from '@/schema/MapState';
import { WorldRoom } from '@/rooms/WorldRoom';

export interface BlockedTile {
  tile: TilePosition;
  character?: CharacterState;
}

export class MovementSystem {
  protected room?: WorldRoom;
  protected blockedTiles = new Map<string, BlockedTile>();

  constructor(room?: WorldRoom) {
    this.room = room;
  }

  public blockTile(tile: TilePosition, character: CharacterState) {
    this.blockedTiles.set(`${tile.x}:${tile.y}`, { tile, character });
    return this.blockedTiles;
  }

  public unblockTile(tile: TilePosition) {
    this.blockedTiles.delete(`${tile.x}:${tile.y}`);
    return this.blockedTiles;
  }

  public isTileBlocked(tile: TilePosition, excludeSessionId?: string) {
    const blockedTile = this.blockedTiles.get(`${tile.x}:${tile.y}`);
    return (
      !!blockedTile && excludeSessionId !== blockedTile?.character?.sessionId
    );
  }

  public static getCharacterHeading(key: string) {
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

  public static getCharacterDirection(heading: Heading) {
    return {
      x: heading === Heading.WEST ? -1 : heading === Heading.EAST ? 1 : 0,
      y: heading === Heading.NORTH ? -1 : heading === Heading.SOUTH ? 1 : 0
    };
  }

  public update(deltaTime: number) {
    if (!this.room) return;
    const { state } = this.room;

    for (const character of state.characters) {
      const speed = character.speed * (1 / deltaTime);
      const inputs: string[] = character.inputs.filter((key) =>
        ['a', 'd', 'w', 's'].includes(key)
      );

      if (inputs.length && !character.isMoving) {
        const [key] = inputs;
        const heading: Heading = MovementSystem.getCharacterHeading(key);
        const direction = MovementSystem.getCharacterDirection(heading);
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

      if (character.isMoving && character.targetTile) {
        const direction = MovementSystem.getCharacterDirection(
          character.heading
        );
        const velocity = {
          x: speed * direction.x,
          y: speed * direction.y
        };

        const x = character.x + velocity.x;
        const y = character.y + velocity.y;

        if (!this.isTileBlocked(character.targetTile, character.sessionId)) {
          character.x = x;
          character.y = y;
        } else {
          character.x = character.tile.x * TILE_SIZE;
          character.y = character.tile.y * TILE_SIZE;
          character.isMoving = false;
          character.targetTile = null;
          return;
        }

        this.handleStopMovement(character, inputs);

        if (character.tile.x !== Math.floor(character.x / TILE_SIZE)) {
          this.unblockTile(character.tile);
          character.tile.x = Math.floor(character.x / TILE_SIZE);
          this.blockTile(character.tile, character);
        }

        if (character.tile.y !== Math.floor(character.y / TILE_SIZE)) {
          this.unblockTile(character.tile);
          character.tile.y = Math.floor(character.y / TILE_SIZE);
          this.blockTile(character.tile, character);
        }
      }

      if (!character.isMoving && !this.isTileBlocked(character.tile)) {
        this.blockTile(character.tile, character);
      }
    }
  }

  private handleStopMovement(character: CharacterState, inputs: string[]) {
    const stopMovement = () => {
      if (this.isTileBlocked(character.targetTile, character.sessionId)) {
        this.blockTile(character.tile, character);
        character.x = character.tile.x * TILE_SIZE;
        character.y = character.tile.y * TILE_SIZE;
        character.isMoving = false;
        character.targetTile = null;
        return;
      }

      character.x = character.targetTile.x * TILE_SIZE;
      character.y = character.targetTile.y * TILE_SIZE;

      const [key] = inputs;
      const heading: Heading = key && MovementSystem.getCharacterHeading(key);
      const direction = MovementSystem.getCharacterDirection(heading);
      const targetTile = new TilePosition({
        x: character.targetTile.x + direction.x,
        y: character.targetTile.y + direction.y
      });

      if (
        heading === character.heading &&
        !this.isTileBlocked(targetTile, character.sessionId)
      ) {
        character.targetTile = targetTile;
      } else {
        character.isMoving = false;
        character.targetTile = null;
      }
    };

    if (
      character.heading === Heading.SOUTH &&
      character.y >= character.targetTile.y * TILE_SIZE
    ) {
      stopMovement();
    }

    if (
      character.heading === Heading.EAST &&
      character.x >= character.targetTile.x * TILE_SIZE
    ) {
      stopMovement();
    }

    if (
      character.heading === Heading.NORTH &&
      character.y <= character.targetTile.y * TILE_SIZE
    ) {
      stopMovement();
    }

    if (
      character.heading === Heading.WEST &&
      character.x <= character.targetTile.x * TILE_SIZE
    ) {
      stopMovement();
    }
  }
}
