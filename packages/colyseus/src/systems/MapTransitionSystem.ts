import { clampPlayableTile } from '@bao/core/loaders/maps/coords';
import { toWorldTile } from '@bao/core/loaders/maps/world';

import { CharacterState } from '@/schema/CharacterState';
import { CharacterService } from '@/services/CharacterService';
import { MapRegistry } from '@/services/MapRegistry';
import { WorldsLoader } from '@/services/WorldsLoader';
import { WorldRoom } from '@/rooms/WorldRoom';

const PLAYABLE_WIDTH = 84;

export class MapTransitionSystem {
  private readonly characterService = new CharacterService();
  private readonly worldsLoader = new WorldsLoader();
  private readonly transitioningSessions = new Set<string>();

  constructor(
    private readonly room: WorldRoom,
    private readonly mapRegistry: MapRegistry
  ) {}

  computeWorldCoords(mapId: number, localX: number, localY: number) {
    const worlds = this.worldsLoader.load();
    if (worlds) {
      return toWorldTile(mapId, localX, localY, worlds);
    }

    return {
      worldX: mapId * PLAYABLE_WIDTH + localX,
      worldY: localY
    };
  }

  async tryTransition(character: CharacterState, authToken?: string) {
    if (!character.sessionId) {
      return false;
    }

    if (this.transitioningSessions.has(character.sessionId)) {
      return false;
    }

    const exit = this.mapRegistry.resolveTransitionExit(
      character.mapId,
      character.tile.x,
      character.tile.y,
      character.heading
    );

    if (!exit) {
      return false;
    }

    this.transitioningSessions.add(character.sessionId);

    try {
      const previousMapId = character.mapId;
      this.room.movementSystem.unblockCharacter(character);
      character.mapId = exit.targetMapId;
      const landing = clampPlayableTile(exit.targetX, exit.targetY);
      character.moveTo(landing.x, landing.y);

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
      this.room.movementSystem.noteMapInterest(character);
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
    } finally {
      this.transitioningSessions.delete(character.sessionId);
    }
  }

  async persistPosition(
    character: CharacterState,
    accountId: number
  ): Promise<void> {
    if (!character.id) {
      return;
    }

    const tile = clampPlayableTile(character.tile.x, character.tile.y);
    if (tile.x !== character.tile.x || tile.y !== character.tile.y) {
      character.moveTo(tile.x, tile.y);
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
