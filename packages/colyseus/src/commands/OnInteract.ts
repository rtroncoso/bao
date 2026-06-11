import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { WorldRoom } from '@/rooms/WorldRoom';

export interface InteractParameters {
  type: 'object' | 'npc';
  entityId: string;
  mapId?: number;
  objectType?: number;
}

export interface OnInteractParameters extends InteractParameters {
  client: Client;
}

export class OnInteractCommand extends Command<
  WorldRoom,
  OnInteractParameters
> {
  execute({ client, type, entityId, mapId }: OnInteractParameters) {
    if (type !== 'object') {
      return;
    }

    const character = this.state.getCharacter(client.sessionId);
    const resolvedMapId = mapId ?? character?.mapId;
    if (!resolvedMapId) {
      return;
    }

    this.room.mapEntitySystem.interactObject(
      client.sessionId,
      resolvedMapId,
      entityId
    );
  }
}
