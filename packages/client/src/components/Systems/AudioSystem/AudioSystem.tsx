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
  const lastMusicKeyRef = useRef<string | null>(null);
  const lastAmbientKeyRef = useRef<string | null>(null);

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

  const audioOverridesBase = manifest?.audio?.overrides;
  const mapMetaPath = mapId ? manifest?.maps?.[String(mapId)] : undefined;

  useEffect(() => {
    const room = gameState.room;
    if (!room) {
      prevTilesRef.current = {};
      return;
    }

    const characterId = gameState.characterId;
    const sessionId = room.sessionId;

    const onStateChange = () => {
      const characters = room.state?.characters;
      if (!characters) {
        return;
      }

      const listener = resolveLocalCharacter(
        room.state,
        characterId,
        sessionId
      );
      if (listener) {
        engine.setListener(listener.tile.x, listener.tile.y);
      }

      for (const character of characters) {
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
            character.sessionId === sessionId || character.id === characterId;

          if (isLocal) {
            engine.playSfx(sfxId);
          } else {
            engine.playSfxAt(sfxId, tile.x, tile.y);
          }
        }

        prevTilesRef.current[key] = tile;
      }
    };

    room.onStateChange(onStateChange);

    return () => {
      prevTilesRef.current = {};
      room.onStateChange.remove?.(onStateChange);
    };
  }, [gameState.room, gameState.characterId, engine]);

  useEffect(() => {
    if (!mapId || !musicId) {
      return;
    }

    const musicKey = `${mapId}:${musicId}`;
    const ambientKey = `${mapId}:${audioOverridesBase ?? ''}:${
      mapMetaPath ?? ''
    }`;
    let cancelled = false;

    void (async () => {
      await unlockAudio();

      const ambientConfig = await loadMapAmbientConfig(
        mapId,
        audioOverridesBase,
        mapMetaPath
      );

      if (cancelled) {
        return;
      }

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

      if (cancelled) {
        return;
      }

      if (lastMusicKeyRef.current !== musicKey) {
        lastMusicKeyRef.current = musicKey;
        engine.stopMusic(500);
        await engine.playMusic(String(musicId), { fadeMs: 1500, loop: true });
      }

      if (lastAmbientKeyRef.current !== ambientKey) {
        lastAmbientKeyRef.current = ambientKey;

        if (ambientTimerRef.current) {
          clearInterval(ambientTimerRef.current);
          ambientTimerRef.current = null;
        }

        if (ambientConfig?.entries?.length) {
          const tick = () => {
            const entry = pickAmbientEntry(
              ambientConfig.entries.filter((item) => item.flags === 1)
            );
            if (entry) {
              engine.playSfx(String(entry.sfxId));
            }
          };

          ambientTimerRef.current = setInterval(tick, ambientConfig.intervalMs);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapId, musicId, engine, audioOverridesBase, mapMetaPath]);

  useEffect(() => {
    if (mapId && musicId) {
      return;
    }

    lastMusicKeyRef.current = null;
    lastAmbientKeyRef.current = null;
    engine.stopMusic(500);

    if (ambientTimerRef.current) {
      clearInterval(ambientTimerRef.current);
      ambientTimerRef.current = null;
    }
  }, [mapId, musicId, engine]);

  useEffect(
    () => () => {
      if (ambientTimerRef.current) {
        clearInterval(ambientTimerRef.current);
        ambientTimerRef.current = null;
      }
    },
    []
  );

  return <>{children}</>;
};
