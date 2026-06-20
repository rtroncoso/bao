import { CharacterState } from '@bao/server/schema/CharacterState';
import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import { getCharacterBySessionId } from '@bao/client/lib/character-index';
import {
  isPerfMetricsEnabled,
  recordResolveLocalCharacter
} from '@bao/client/lib/perf-metrics';

export const resolveLocalCharacter = (
  serverState: WorldRoomState | undefined,
  characterId: string | undefined,
  sessionId: string | undefined
): CharacterState | null => {
  if (!serverState?.characters) {
    return null;
  }

  if (isPerfMetricsEnabled()) {
    recordResolveLocalCharacter();
  }

  if (sessionId) {
    const indexed = getCharacterBySessionId(sessionId);
    if (indexed) {
      return indexed;
    }

    for (const character of serverState.characters) {
      if (character.sessionId === sessionId) {
        return character;
      }
    }

    return null;
  }

  if (characterId) {
    const id = parseInt(String(characterId), 10);
    if (!Number.isNaN(id)) {
      for (const character of serverState.characters) {
        if (character.id === id) {
          return character;
        }
      }
    }
  }

  return null;
};
