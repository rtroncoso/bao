import type { Room } from 'colyseus.js';

import { CharacterState } from '@bao/server/schema/CharacterState';
import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import {
  rebuildCharacterIndex,
  getCharacterBySessionId,
  clearCharacterIndex
} from '@bao/client/lib/character-index';
import { resolveLocalCharacter } from '@bao/client/lib/resolve-local-character';
import {
  isPerfMetricsEnabled,
  measure,
  recordPatchListener,
  recordResolveLocalCharacter
} from '@bao/client/lib/perf-metrics';

/** Live room state — updated each Colyseus patch without React setState. */
export const gameServerStateRef: {
  current: WorldRoomState | undefined;
} = { current: undefined };

export const gameRoomRef: {
  current: Room<WorldRoomState> | undefined;
} = { current: undefined };

export const gameCharacterIdRef: {
  current: string | undefined;
} = { current: undefined };

export const localCharacterRef: {
  current: CharacterState | null;
} = { current: null };

export const syncLocalCharacterFromPatch = (): CharacterState | null => {
  const room = gameRoomRef.current;
  const state = gameServerStateRef.current;

  if (!room || !state) {
    localCharacterRef.current = null;
    return null;
  }

  if (isPerfMetricsEnabled()) {
    recordResolveLocalCharacter();
  }

  const sessionId = room.sessionId;
  if (sessionId) {
    const indexed = getCharacterBySessionId(sessionId);
    if (indexed) {
      localCharacterRef.current = indexed;
      return indexed;
    }
  }

  localCharacterRef.current = resolveLocalCharacter(
    state,
    gameCharacterIdRef.current,
    room.sessionId
  );
  return localCharacterRef.current;
};

export type PatchEventKind = 'tile' | 'map' | 'characters' | 'any';

export interface PatchFrameContext {
  tileChanged: boolean;
  mapChanged: boolean;
  charactersChanged: boolean;
}

type PatchListener = {
  events: PatchEventKind[];
  handler: (context: PatchFrameContext) => void;
};

const patchListeners = new Set<PatchListener>();
let patchFrameScheduled = false;

let lastTileKey: string | null = null;
let lastMapId: number | null = null;
let lastCharacterSessionsKey = '';

const characterSessionsKey = (
  characters: Iterable<CharacterState> | undefined | null
): string => {
  if (!characters) {
    return '';
  }

  const parts: string[] = [];
  for (const character of characters) {
    parts.push(character.sessionId ?? String(character.id));
  }

  return parts.join('|');
};

const computePatchContext = (
  local: CharacterState | null
): PatchFrameContext => {
  const tileKey = local
    ? `${local.mapId}:${local.tile.x},${local.tile.y}`
    : null;
  const tileChanged = tileKey !== null && tileKey !== lastTileKey;
  if (tileKey !== null) {
    lastTileKey = tileKey;
  }

  const mapId = local?.mapId ?? null;
  const mapChanged = mapId !== null && mapId !== lastMapId;
  if (mapId !== null) {
    lastMapId = mapId;
  }

  const state = gameServerStateRef.current;
  const sessionsKey = characterSessionsKey(state?.characters);
  const charactersChanged = sessionsKey !== lastCharacterSessionsKey;
  if (charactersChanged) {
    lastCharacterSessionsKey = sessionsKey;
  }

  return { tileChanged, mapChanged, charactersChanged };
};

const listenerMatches = (
  listener: PatchListener,
  context: PatchFrameContext
): boolean => {
  if (listener.events.includes('any')) {
    return true;
  }

  return listener.events.some((event) => {
    switch (event) {
      case 'tile':
        return context.tileChanged;
      case 'map':
        return context.mapChanged;
      case 'characters':
        return context.charactersChanged;
      default:
        return false;
    }
  });
};

export const subscribeGamePatch = (
  handler: (context: PatchFrameContext) => void,
  events: PatchEventKind[] = ['any']
): (() => void) => {
  const listener: PatchListener = { events, handler };
  patchListeners.add(listener);
  return () => {
    patchListeners.delete(listener);
  };
};

/** Coalesce patch notifications to one frame — avoids bursty sync while moving. */
export const notifyGamePatch = (): void => {
  if (patchFrameScheduled) {
    return;
  }

  patchFrameScheduled = true;

  requestAnimationFrame(() => {
    patchFrameScheduled = false;

    const state = gameServerStateRef.current;
    rebuildCharacterIndex(state?.characters);

    const local = syncLocalCharacterFromPatch();
    const context = computePatchContext(local);

    for (const listener of patchListeners) {
      if (!listenerMatches(listener, context)) {
        continue;
      }

      if (isPerfMetricsEnabled()) {
        const [, durationMs] = measure(() => listener.handler(context));
        recordPatchListener(durationMs);
      } else {
        listener.handler(context);
      }
    }
  });
};

export const resetPatchTracking = (): void => {
  lastTileKey = null;
  lastMapId = null;
  lastCharacterSessionsKey = '';
};

export const getGameServerState = (): WorldRoomState | undefined =>
  gameServerStateRef.current;

export const clearGameRoomRefs = (): void => {
  gameRoomRef.current = undefined;
  gameServerStateRef.current = undefined;
  gameCharacterIdRef.current = undefined;
  localCharacterRef.current = null;
  clearCharacterIndex();
  resetPatchTracking();
};
