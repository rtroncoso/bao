import { Heading, TILE_SIZE } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { TilePosition } from '@/schema/MapState';
import { WorldRoom } from 'src/rooms/WorldRoom';

export class MovementSystem {
  protected room: WorldRoom;
  protected blockedTiles: Array<[string, TilePosition]> = [];

  constructor(room: WorldRoom) {
    this.room = room;
  }

  public blockTile(tile: TilePosition, character: CharacterState) {
    this.blockedTiles.push([character.sessionId, tile]);
    return (this.blockedTiles = [...new Set(this.blockedTiles)]);
  }

  public unblockTile(tile: TilePosition, character: CharacterState) {
    const index = this.findBlockedTileIndex(tile, character.sessionId);
    if (index) this.blockedTiles.splice(index);
    return this.blockedTiles;
  }

  private findBlockedTileIndex(tile: TilePosition, excludeSessionId?: string) {
    return this.blockedTiles.findIndex(
      ([sessionId, blockedTile]) =>
        sessionId !== excludeSessionId &&
        blockedTile.x === tile.x &&
        blockedTile.y === tile.y
    );
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

      this.unblockTile(character.tile, character);
      character.x = character.targetTile.x * TILE_SIZE;
      character.y = character.targetTile.y * TILE_SIZE;

      const [key] = inputs;
      const heading: Heading = key && this.getCharacterHeading(key);
      const direction = this.getCharacterDirection(heading);
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
        this.blockTile(character.tile, character);
        character.isMoving = false;
        character.targetTile = null;
      }
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
      const inputs: string[] = character.inputs.filter((key) =>
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

      if (character.isMoving && character.targetTile) {
        const direction = this.getCharacterDirection(character.heading);
        const velocity = {
          x: speed * direction.x,
          y: speed * direction.y
        };

        const x = character.x + velocity.x;
        const y = character.y + velocity.y;
        const tile = new TilePosition({
          x: Math.floor(x / TILE_SIZE),
          y: Math.floor(y / TILE_SIZE)
        });

        if (!this.isTileBlocked(tile, character.sessionId)) {
          character.x = x;
          character.y = y;
        } else {
          this.blockTile(character.tile, character);
          character.x = character.tile.x * TILE_SIZE;
          character.y = character.tile.y * TILE_SIZE;
          character.isMoving = false;
          character.targetTile = null;
          return;
        }
      }

      this.handleStopMovement(character, inputs);

      if (character.tile.x !== Math.floor(character.x / TILE_SIZE)) {
        character.tile.x = Math.floor(character.x / TILE_SIZE);
        this.blockTile(character.tile, character);
      }

      if (character.tile.y !== Math.floor(character.y / TILE_SIZE)) {
        character.tile.y = Math.floor(character.y / TILE_SIZE);
        this.blockTile(character.tile, character);
      }
    });
  }
}
