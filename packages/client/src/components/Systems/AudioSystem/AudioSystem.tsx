import React, { useEffect, useRef } from 'react';

import { AO_FOOTSTEP_1, AO_FOOTSTEP_2 } from '@bao/core/constants/audio';
import { getAudioEngine, unlockAudio } from '@bao/client/lib/audio-engine';
import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { useSelector } from 'react-redux';
import { selectManifest } from '@bao/client/queries';

import { loadMapAmbientConfig, pickAmbientEntry } from './mapAudio';

interface TileSnapshot {
  x: number;
  y: number;
}

const tileSnapshot = (character: CharacterState): TileSnapshot => ({
  x: character.tile.x,
  y: character.tile.y
});

export const AudioSystem: React.FC = ({ children }) => {
  const engine = getAudioEngine();
  const { state: gameState } = useGameContext();
  const { currentMapId } = useWorldContext();
  const manifest = useSelector(selectManifest);
  const ambientTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const footstepPhaseRef = useRef<Record<string, boolean>>({});
  const prevTilesRef = useRef<Record<string, TileSnapshot>>({});
  const activeMapIdRef = useRef<number | null>(null);

  const localCharacter = resolveLocalCharacter(
    gameState.serverState,
    gameState.characterId,
    gameState.room?.sessionId
  );

  const mapId = localCharacter?.mapId ?? currentMapId;

  const musicId =
    mapId && gameState.serverState
      ? gameState.serverState.maps?.get(String(mapId))?.musicId ?? 0
      : 0;

  useEffect(() => {
    if (!manifest?.audio) {
      return;
    }
    engine.registerManifest({
      music: manifest.audio.music,
      sfx: manifest.audio.sfx
    });
  }, [engine, manifest?.audio?.music, manifest?.audio?.sfx]);

  const characterTileKey = gameState.serverState?.characters
    ? [...gameState.serverState.characters]
        .map(
          (character) =>
            `${character.sessionId}:${character.tile.x}:${character.tile.y}:${character.isMoving}`
        )
        .join('|')
    : '';

  useEffect(() => {
    if (!localCharacter) {
      return;
    }

    engine.setListener(localCharacter.tile.x, localCharacter.tile.y);
  }, [engine, localCharacter?.tile.x, localCharacter?.tile.y, localCharacter]);

  useEffect(() => {
    if (!mapId || !musicId) {
      return;
    }

    void (async () => {
      await unlockAudio();

      const overridesBase = manifest?.audio?.overrides;
      const mapPath = manifest?.maps?.[String(mapId)];
      const ambientConfig = await loadMapAmbientConfig(
        mapId,
        overridesBase,
        mapPath
      );

      const prefetchIds: Array<{ id: string; kind: 'music' | 'sfx' }> = [
        { id: String(musicId), kind: 'music' },
        { id: AO_FOOTSTEP_1, kind: 'sfx' },
        { id: AO_FOOTSTEP_2, kind: 'sfx' },
        ...(ambientConfig?.entries.map((entry) => ({
          id: String(entry.sfxId),
          kind: 'sfx' as const
        })) ?? [])
      ];

      await engine.prefetch(prefetchIds);
      engine.stopMusic(500);
      await engine.playMusic(String(musicId), { fadeMs: 1500, loop: true });
    })();
  }, [mapId, musicId, engine, manifest?.audio?.overrides, manifest?.maps]);

  useEffect(() => {
    if (!mapId || activeMapIdRef.current === mapId) {
      if (activeMapIdRef.current !== mapId) {
        activeMapIdRef.current = mapId;
      }
    } else {
      activeMapIdRef.current = mapId;
    }

    if (ambientTimerRef.current) {
      clearInterval(ambientTimerRef.current);
      ambientTimerRef.current = null;
    }

    const overridesBase = manifest?.audio?.overrides;
    const mapPath = manifest?.maps?.[String(mapId)];

    let cancelled = false;

    void (async () => {
      const config = await loadMapAmbientConfig(mapId, overridesBase, mapPath);

      if (cancelled || !config?.entries?.length) {
        return;
      }

      const tick = () => {
        const entry = pickAmbientEntry(
          config.entries.filter((item) => item.flags === 1)
        );
        if (entry) {
          engine.playSfx(String(entry.sfxId));
        }
      };

      ambientTimerRef.current = setInterval(tick, config.intervalMs);
    })();

    return () => {
      cancelled = true;
      if (ambientTimerRef.current) {
        clearInterval(ambientTimerRef.current);
        ambientTimerRef.current = null;
      }
    };
  }, [mapId, engine, manifest?.audio?.overrides, manifest?.maps]);

  useEffect(() => {
    if (!gameState.serverState?.characters) {
      return;
    }

    for (const character of gameState.serverState.characters) {
      const key = character.sessionId ?? String(character.id);
      const tile = tileSnapshot(character);
      const prev = prevTilesRef.current[key];

      if (
        prev &&
        (prev.x !== tile.x || prev.y !== tile.y) &&
        character.isMoving
      ) {
        const useFirst = footstepPhaseRef.current[key] ?? true;
        footstepPhaseRef.current[key] = !useFirst;
        const sfxId = useFirst ? AO_FOOTSTEP_1 : AO_FOOTSTEP_2;
        const isLocal =
          character.sessionId === gameState.room?.sessionId ||
          character.id === gameState.characterId;

        if (isLocal) {
          engine.playSfx(sfxId);
        } else {
          engine.playSfxAt(sfxId, tile.x, tile.y);
        }
      }

      prevTilesRef.current[key] = tile;
    }
  }, [
    characterTileKey,
    engine,
    gameState.room?.sessionId,
    gameState.characterId,
    gameState.serverState?.characters
  ]);

  return <>{children}</>;
};
