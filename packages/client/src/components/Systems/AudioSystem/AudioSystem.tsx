import React, { useEffect, useRef } from 'react';

import {
  AO_DOOR_SFX,
  AO_FOOTSTEP_1,
  AO_FOOTSTEP_2,
  WORLD_SFX_MESSAGE
} from '@bao/core/constants/audio';
import type { WorldSfxPayload } from '@bao/core/constants/audio/Messages';
import { getAudioEngine, unlockAudio } from '@bao/client/lib/audio-engine';
import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { mapTileToWorldTile } from '@bao/client/lib/world-viewport';
import { useSelector } from 'react-redux';
import { selectManifest } from '@bao/client/queries';

import { loadMapAmbientConfig, pickAmbientEntry } from './mapAudio';
import { playWorldSfxIfInViewport } from './worldSfx';

export const AudioSystem: React.FC = ({ children }) => {
  const engine = getAudioEngine();
  const { state: gameState } = useGameContext();
  const { currentMapId, worlds } = useWorldContext();
  const manifest = useSelector(selectManifest);
  const ambientTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
  const manifestReady = Boolean(manifest?.audio?.music || manifest?.audio?.sfx);

  useEffect(() => {
    if (!manifest?.audio?.music && !manifest?.audio?.sfx) {
      return;
    }

    engine.registerManifest({
      music: manifest.audio.music,
      sfx: manifest.audio.sfx
    });
  }, [engine, manifest?.audio?.music, manifest?.audio?.sfx]);

  useEffect(() => {
    if (!localCharacter?.mapId) {
      return;
    }

    const listenerTile = mapTileToWorldTile(
      localCharacter.mapId,
      localCharacter.tile.x,
      localCharacter.tile.y,
      worlds
    );

    engine.setListener(listenerTile.x, listenerTile.y);
  }, [
    engine,
    localCharacter?.mapId,
    localCharacter?.tile.x,
    localCharacter?.tile.y,
    worlds
  ]);

  useEffect(() => {
    const room = gameState.room;
    if (!room) {
      return;
    }

    const onWorldSfx = (payload: WorldSfxPayload) => {
      playWorldSfxIfInViewport(engine, payload, worlds);
    };

    room.onMessage(WORLD_SFX_MESSAGE, onWorldSfx);
  }, [engine, gameState.room, worlds]);

  useEffect(() => {
    if (!mapId || !manifestReady) {
      return;
    }

    const musicTrackId = musicId > 0 ? String(musicId) : null;
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
        { id: AO_FOOTSTEP_1, kind: 'sfx' },
        { id: AO_FOOTSTEP_2, kind: 'sfx' },
        { id: AO_DOOR_SFX, kind: 'sfx' },
        ...(musicId > 0
          ? [{ id: String(musicId), kind: 'music' as const }]
          : []),
        ...(ambientConfig?.entries.map((entry) => ({
          id: String(entry.sfxId),
          kind: 'sfx' as const
        })) ?? [])
      ];

      await engine.prefetch(prefetchIds);

      if (cancelled) {
        return;
      }

      if (musicTrackId && !engine.isMusicPlaying(musicTrackId)) {
        engine.stopMusic(500);
        await engine.playMusic(musicTrackId, {
          fadeMs: 1500,
          loop: true
        });
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
              engine.playAmbientSfx(String(entry.sfxId));
            }
          };

          ambientTimerRef.current = setInterval(tick, ambientConfig.intervalMs);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapId, musicId, manifestReady, engine, audioOverridesBase, mapMetaPath]);

  useEffect(() => {
    if (mapId) {
      return;
    }

    lastAmbientKeyRef.current = null;
    engine.stopMusic(500);

    if (ambientTimerRef.current) {
      clearInterval(ambientTimerRef.current);
      ambientTimerRef.current = null;
    }
  }, [mapId, engine]);

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
