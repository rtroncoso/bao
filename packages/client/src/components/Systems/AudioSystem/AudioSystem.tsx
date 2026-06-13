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
  }, [engine, localCharacter?.tile.x, localCharacter?.tile.y]);

  useEffect(() => {
    if (!gameState.serverState?.characters) {
      return;
    }

    const sessionId = gameState.room?.sessionId;
    const localCharacterId =
      gameState.characterId !== undefined
        ? Number.parseInt(String(gameState.characterId), 10)
        : Number.NaN;

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
          character.sessionId === sessionId ||
          (!Number.isNaN(localCharacterId) &&
            character.id === localCharacterId);

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
    gameState.characterId
  ]);

  useEffect(() => {
    if (!mapId || !manifestReady) {
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
        { id: AO_FOOTSTEP_1, kind: 'sfx' },
        { id: AO_FOOTSTEP_2, kind: 'sfx' },
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

      if (musicId > 0 && lastMusicKeyRef.current !== musicKey) {
        engine.stopMusic(500);
        const played = await engine.playMusic(String(musicId), {
          fadeMs: 1500,
          loop: true
        });
        if (played) {
          lastMusicKeyRef.current = musicKey;
        }
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
  }, [mapId, musicId, manifestReady, engine, audioOverridesBase, mapMetaPath]);

  useEffect(() => {
    if (mapId) {
      return;
    }

    lastMusicKeyRef.current = null;
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
