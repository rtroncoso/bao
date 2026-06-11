import { TILE_SIZE } from '@bao/core';

import { CharacterState } from '@/schema/CharacterState';
import { CharacterService } from '@/services/CharacterService';
import { MapRegistry } from '@/services/MapRegistry';
import { WorldRoom } from '@/rooms/WorldRoom';

const PLAYABLE_WIDTH = 84;
const PLAYABLE_HEIGHT = 88;

export class MapTransitionSystem {
  private readonly characterService = new CharacterService();

  constructor(
    private readonly room: WorldRoom,
    private readonly mapRegistry: MapRegistry
  ) {}

  computeWorldCoords(mapId: number, localX: number, localY: number) {
    return {
      worldX: mapId * PLAYABLE_WIDTH + localX,
      worldY: localY
    };
  }

  async tryTransition(character: CharacterState, authToken?: string) {
    const exit = this.mapRegistry.getTileExit(
      character.mapId,
      character.tile.x,
      character.tile.y
    );

    if (!exit) {
      return false;
    }

    const previousMapId = character.mapId;
    this.room.movementSystem.unblockCharacter(character);
    character.mapId = exit.targetMapId;
    character.moveTo(exit.targetX, exit.targetY);

    const worldCoords = this.computeWorldCoords(
      character.mapId,
      character.tile.x,
      character.tile.y
    );
    character.worldX = worldCoords.worldX;
    character.worldY = worldCoords.worldY;

    this.mapRegistry.unregisterCharacter(previousMapId);
    this.mapRegistry.registerCharacter(character.mapId);
    await this.mapRegistry.ensureMapsInInterest(
      character.mapId,
      character.tile.x,
      character.tile.y,
      authToken
    );
    this.mapRegistry.pruneMapsOutsideInterest();
    this.room.movementSystem.blockTile(character.tile, character);

    const accountId = this.room.accountIdBySession.get(character.sessionId);
    if (accountId) {
      try {
        await this.persistPosition(character, accountId);
      } catch (error) {
        console.error(
          '[MapTransitionSystem] failed to persist position:',
          error
        );
      }
    }

    return true;
  }

  async persistPosition(
    character: CharacterState,
    accountId: number
  ): Promise<void> {
    if (!character.id) {
      return;
    }

    const worldCoords = this.computeWorldCoords(
      character.mapId,
      character.tile.x,
      character.tile.y
    );

    character.worldX = worldCoords.worldX;
    character.worldY = worldCoords.worldY;

    await this.characterService.updatePosition(character.id, accountId, {
      mapId: character.mapId,
      x: character.tile.x,
      y: character.tile.y,
      worldX: character.worldX,
      worldY: character.worldY
    });
  }
}
