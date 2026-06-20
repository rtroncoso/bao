import React, { useEffect, useRef } from 'react';

import { AO_FOOTSTEP_1, AO_FOOTSTEP_2 } from '@bao/core/constants/audio';
import { getAudioEngine } from '@bao/client/lib/audio-engine';
import {
  gameRoomRef,
  subscribeGamePatch
} from '@bao/client/lib/game-server-state';
import { mapTileToWorldTile } from '@bao/client/lib/world-viewport';
import { useGameContext } from '@bao/client/components/Game';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import {
  isPerfMetricsEnabled,
  measure,
  recordFootstepSync
} from '@bao/client/lib/perf-metrics';

interface TileSnapshot {
  x: number;
  y: number;
}

/** Client-side footsteps on tile change (replaces server WORLD_SFX broadcasts). */
export const FootstepAudioSync: React.FC = () => {
  const engine = getAudioEngine();
  const { state: gameState } = useGameContext();
  const { worlds } = useWorldContext();
  const worldsRef = useRef(worlds);
  const footstepPhaseRef = useRef<Record<string, boolean>>({});
  const prevTilesRef = useRef<Record<string, TileSnapshot>>({});
  const sessionIdRef = useRef(gameState.room?.sessionId);
  const characterIdRef = useRef(gameState.characterId);

  worldsRef.current = worlds;
  sessionIdRef.current = gameState.room?.sessionId;
  characterIdRef.current = gameState.characterId;

  useEffect(() => {
    const syncFootsteps = () => {
      const run = () => {
        const prefs = engine.getPrefs();
        if (prefs.muted.sfx || prefs.sfx <= 0) {
          return;
        }

        const room = gameRoomRef.current;
        const characters = room?.state?.characters;
        if (!characters?.length) {
          return;
        }

        const sessionId = sessionIdRef.current;
        const characterId = characterIdRef.current;

        for (const character of characters) {
          const key = character.sessionId ?? String(character.id);

          if (!character.isMoving) {
            prevTilesRef.current[key] = {
              x: character.tile.x,
              y: character.tile.y
            };
            continue;
          }

          const tile = { x: character.tile.x, y: character.tile.y };
          const prev = prevTilesRef.current[key];

          if (prev && (prev.x !== tile.x || prev.y !== tile.y)) {
            const useFirst = footstepPhaseRef.current[key] ?? true;
            footstepPhaseRef.current[key] = !useFirst;
            const sfxId = useFirst ? AO_FOOTSTEP_1 : AO_FOOTSTEP_2;
            const isLocal =
              character.sessionId === sessionId ||
              String(character.id) === String(characterId);

            if (isLocal) {
              engine.playSfx(sfxId);
            } else {
              const worldTile = mapTileToWorldTile(
                character.mapId,
                tile.x,
                tile.y,
                worldsRef.current
              );
              engine.playSfxAt(sfxId, worldTile.x, worldTile.y);
            }
          }

          prevTilesRef.current[key] = tile;
        }
      };

      if (isPerfMetricsEnabled()) {
        const [, durationMs] = measure(run);
        recordFootstepSync(durationMs);
      } else {
        run();
      }
    };

    return subscribeGamePatch(syncFootsteps, ['tile']);
  }, [engine]);

  return null;
};
