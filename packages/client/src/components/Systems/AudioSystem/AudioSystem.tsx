import React, { useEffect, useRef, useState } from 'react';

import {
  AO_DOOR_SFX,
  AO_FOOTSTEP_1,
  AO_FOOTSTEP_2,
  WORLD_SFX_MESSAGE
} from '@bao/core/constants/audio';
import type { WorldSfxPayload } from '@bao/core/constants/audio/Messages';
import { getAudioEngine, unlockAudio } from '@bao/client/lib/audio-engine';
import {
  localCharacterRef,
  subscribeGamePatch
} from '@bao/client/lib/game-server-state';
import { useGameContext } from '@bao/client/components/Game';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { mapTileToWorldTile } from '@bao/client/lib/world-viewport';
import { useSelector } from 'react-redux';
import { selectManifest } from '@bao/client/queries';

import { loadMapAmbientConfig, pickAmbientEntry } from './mapAudio';
import { playWorldSfxIfInViewport } from './worldSfx';

const FOOTSTEP_SFX_IDS = new Set([AO_FOOTSTEP_1, AO_FOOTSTEP_2]);

export const AudioSystem: React.FC = ({ children }) => {
  const engine = getAudioEngine();
  const { state: gameState } = useGameContext();
  const { currentMapId, worlds } = useWorldContext();
  const manifest = useSelector(selectManifest);
  const ambientTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAmbientKeyRef = useRef<string | null>(null);
  const lastAudioMapIdRef = useRef<number | null>(null);
  const lastAudioMusicIdRef = useRef(0);
  const lastListenerTileRef = useRef<string | null>(null);
  const worldsRef = useRef(worlds);
  const [audioMapId, setAudioMapId] = useState<number | null>(null);
  const [audioMusicId, setAudioMusicId] = useState(0);

  worldsRef.current = worlds;

  const audioOverridesBase = manifest?.audio?.overrides;
  const mapMetaPath = audioMapId
    ? manifest?.maps?.[String(audioMapId)]
    : undefined;
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
    const room = gameState.room;
    if (!room) {
      lastAudioMapIdRef.current = null;
      lastAudioMusicIdRef.current = 0;
      setAudioMapId(null);
      setAudioMusicId(0);
      return;
    }

    const onPatch = () => {
      const local = localCharacterRef.current;
      const mapId = local?.mapId ?? currentMapId;
      const musicId =
        mapId && room.state.maps?.get(String(mapId))?.musicId
          ? room.state.maps.get(String(mapId))!.musicId
          : 0;

      if (mapId !== lastAudioMapIdRef.current) {
        lastAudioMapIdRef.current = mapId;
        setAudioMapId(mapId);
      }

      if (musicId !== lastAudioMusicIdRef.current) {
        lastAudioMusicIdRef.current = musicId;
        setAudioMusicId(musicId);
      }

      if (local) {
        const tileKey = `${local.mapId}:${local.tile.x},${local.tile.y}`;
        if (tileKey !== lastListenerTileRef.current) {
          lastListenerTileRef.current = tileKey;
          const listenerTile = mapTileToWorldTile(
            local.mapId,
            local.tile.x,
            local.tile.y,
            worldsRef.current
          );
          engine.setListener(listenerTile.x, listenerTile.y);
        }
      }
    };

    onPatch();
    return subscribeGamePatch(onPatch, ['tile', 'map']);
  }, [gameState.room, gameState.characterId, currentMapId, engine]);

  useEffect(() => {
    const room = gameState.room;
    if (!room) {
      return;
    }

    const onWorldSfx = (payload: WorldSfxPayload) => {
      if (FOOTSTEP_SFX_IDS.has(payload.sfxId)) {
        return;
      }

      playWorldSfxIfInViewport(engine, payload, worldsRef.current);
    };

    room.onMessage(WORLD_SFX_MESSAGE, onWorldSfx);

    return () => {
      (room.onMessage as { remove?: typeof room.onMessage }).remove?.(
        WORLD_SFX_MESSAGE,
        onWorldSfx
      );
    };
  }, [engine, gameState.room]);

  useEffect(() => {
    if (!audioMapId || !manifestReady) {
      return;
    }

    const musicTrackId = audioMusicId > 0 ? String(audioMusicId) : null;
    const ambientKey = `${audioMapId}:${audioOverridesBase ?? ''}:${
      mapMetaPath ?? ''
    }`;
    let cancelled = false;

    void (async () => {
      await unlockAudio();

      const ambientConfig = await loadMapAmbientConfig(
        audioMapId,
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
        ...(audioMusicId > 0
          ? [{ id: String(audioMusicId), kind: 'music' as const }]
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
  }, [
    audioMapId,
    audioMusicId,
    manifestReady,
    engine,
    audioOverridesBase,
    mapMetaPath
  ]);

  useEffect(() => {
    if (audioMapId) {
      return;
    }

    lastAmbientKeyRef.current = null;
    engine.stopMusic(500);

    if (ambientTimerRef.current) {
      clearInterval(ambientTimerRef.current);
      ambientTimerRef.current = null;
    }
  }, [audioMapId, engine]);

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
