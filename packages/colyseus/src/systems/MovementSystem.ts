import { getQuadrant, Heading, TILE_SIZE, TILED_MAP_SIZE } from '@bao/core';
import { AO_FOOTSTEP_1, AO_FOOTSTEP_2 } from '@bao/core/constants/audio';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { TilePosition } from '@/schema/MapState';
import { WorldRoom } from '@/rooms/WorldRoom';

import { broadcastWorldSfx } from './worldSfx';

export interface BlockedTile {
  tile: TilePosition;
  character?: CharacterState;
}

export class MovementSystem {
  protected room?: WorldRoom;
  protected blockedTiles = new Map<string, BlockedTile>();
  private interestKeyBySession = new Map<string, string>();
  private footstepPhaseBySession = new Map<string, boolean>();

  constructor(room?: WorldRoom) {
    this.room = room;
  }

  private tileKey(mapId: number, tile: TilePosition) {
    return `${mapId}:${tile.x}:${tile.y}`;
  }

  public blockTile(tile: TilePosition, character: CharacterState) {
    this.blockedTiles.set(this.tileKey(character.mapId, tile), {
      tile,
      character
    });
    return this.blockedTiles;
  }

  public unblockTile(tile: TilePosition, mapId: number) {
    this.blockedTiles.delete(this.tileKey(mapId, tile));
    return this.blockedTiles;
  }

  public unblockCharacter(character: CharacterState) {
    this.unblockTile(character.tile, character.mapId);
    if (character.sessionId) {
      this.footstepPhaseBySession.delete(character.sessionId);
    }
  }

  private emitFootstep(character: CharacterState) {
    if (!this.room || !character.sessionId) {
      return;
    }

    const useFirst =
      this.footstepPhaseBySession.get(character.sessionId) ?? true;
    this.footstepPhaseBySession.set(character.sessionId, !useFirst);

    broadcastWorldSfx(this.room, {
      sfxId: useFirst ? AO_FOOTSTEP_1 : AO_FOOTSTEP_2,
      mapId: character.mapId,
      x: character.tile.x,
      y: character.tile.y
    });
  }

  public isTileBlocked(
    tile: TilePosition,
    mapId: number,
    excludeSessionId?: string
  ) {
    if (
      this.room?.mapRegistry?.isTileStaticallyBlocked(mapId, tile.x, tile.y)
    ) {
      return true;
    }

    const blockedTile = this.blockedTiles.get(this.tileKey(mapId, tile));
    return (
      !!blockedTile && excludeSessionId !== blockedTile?.character?.sessionId
    );
  }

  private isOutOfBounds(tile: TilePosition): boolean {
    const [playableWidth, playableHeight] = TILED_MAP_SIZE;
    return (
      tile.x < 0 ||
      tile.y < 0 ||
      tile.x >= playableWidth ||
      tile.y >= playableHeight
    );
  }

  private canTransitionFrom(
    character: CharacterState,
    heading: Heading
  ): boolean {
    if (!this.room?.mapRegistry) {
      return false;
    }

    return Boolean(
      this.room.mapRegistry.resolveTransitionExit(
        character.mapId,
        character.tile.x,
        character.tile.y,
        heading
      )
    );
  }

  /** Returns true when a transition was started (movement should stop). */
  private attemptMapTransition(
    character: CharacterState,
    heading: Heading,
    targetTile: TilePosition
  ): boolean {
    if (
      !this.isOutOfBounds(targetTile) ||
      !this.canTransitionFrom(character, heading)
    ) {
      return false;
    }

    character.isMoving = false;
    character.targetTile = null;
    this.checkMapTransition(character);
    return true;
  }

  private checkMapTransition(character: CharacterState) {
    if (!this.room?.mapTransitionSystem || !character.sessionId) {
      return;
    }

    const authToken = this.room.authTokenBySession.get(character.sessionId);
    void this.room.mapTransitionSystem.tryTransition(character, authToken);
  }

  noteMapInterest(character: CharacterState) {
    if (!character.sessionId) {
      return;
    }

    this.interestKeyBySession.set(
      character.sessionId,
      `${character.mapId}:${getQuadrant(character.tile.x, character.tile.y)}`
    );
  }

  refreshMapInterest(character: CharacterState) {
    if (character.sessionId) {
      this.interestKeyBySession.delete(character.sessionId);
    }
    this.updateMapInterest(character);
  }

  private updateMapInterest(character: CharacterState) {
    if (!this.room?.mapRegistry || !character.sessionId) {
      return;
    }

    const interestKey = `${character.mapId}:${getQuadrant(
      character.tile.x,
      character.tile.y
    )}`;

    if (this.interestKeyBySession.get(character.sessionId) === interestKey) {
      return;
    }

    this.interestKeyBySession.set(character.sessionId, interestKey);
    const authToken = this.room.authTokenBySession.get(character.sessionId);

    void this.room.mapRegistry
      .ensureMapsInInterest(
        character.mapId,
        character.tile.x,
        character.tile.y,
        authToken
      )
      .then(() => this.room?.mapRegistry.pruneMapsOutsideInterest())
      .catch((error) => {
        console.error('[MovementSystem] failed to update map interest', error);
      });
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

        if (this.attemptMapTransition(character, heading, targetTile)) {
          continue;
        }

        if (
          !this.isTileBlocked(targetTile, character.mapId, character.sessionId)
        ) {
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

        if (
          !this.isTileBlocked(
            character.targetTile,
            character.mapId,
            character.sessionId
          )
        ) {
          character.x = x;
          character.y = y;
        } else {
          character.x = character.tile.x * TILE_SIZE;
          character.y = character.tile.y * TILE_SIZE;
          character.isMoving = false;
          character.targetTile = null;
          continue;
        }

        const wasMoving = character.isMoving;
        this.handleStopMovement(character, inputs);

        let crossedTile = false;

        if (character.tile.x !== Math.floor(character.x / TILE_SIZE)) {
          this.unblockTile(character.tile, character.mapId);
          character.tile.x = Math.floor(character.x / TILE_SIZE);
          this.blockTile(character.tile, character);
          this.updateMapInterest(character);
          crossedTile = true;
        }

        if (character.tile.y !== Math.floor(character.y / TILE_SIZE)) {
          this.unblockTile(character.tile, character.mapId);
          character.tile.y = Math.floor(character.y / TILE_SIZE);
          this.blockTile(character.tile, character);
          this.updateMapInterest(character);
          crossedTile = true;
        }

        if (crossedTile) {
          this.emitFootstep(character);
        }

        if (character.isMoving && character.targetTile) {
          if (
            this.attemptMapTransition(
              character,
              character.heading,
              character.targetTile
            )
          ) {
            continue;
          }
        }

        if (wasMoving && !character.isMoving) {
          this.checkMapTransition(character);
        }
      }

      if (
        !character.isMoving &&
        !this.isTileBlocked(
          character.tile,
          character.mapId,
          character.sessionId
        )
      ) {
        this.blockTile(character.tile, character);
      }
    }
  }

  private handleStopMovement(character: CharacterState, inputs: string[]) {
    const stopMovement = () => {
      if (
        this.isTileBlocked(
          character.targetTile,
          character.mapId,
          character.sessionId
        )
      ) {
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

      if (heading === character.heading) {
        if (this.attemptMapTransition(character, heading, targetTile)) {
          return;
        }

        if (
          !this.isTileBlocked(targetTile, character.mapId, character.sessionId)
        ) {
          character.targetTile = targetTile;
          return;
        }
      }

      character.isMoving = false;
      character.targetTile = null;
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
