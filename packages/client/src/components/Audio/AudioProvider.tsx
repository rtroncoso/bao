'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react';

import {
  AudioEngine,
  AudioTrack,
  DEFAULT_VOLUME_PREFS,
  VolumePrefs
} from '@bao/audio';

import { getAudioEngine, unlockAudio } from '@bao/client/lib/audio-engine';

const STORAGE_KEY = 'bao.audio.prefs';

interface AudioContextValue {
  engine: AudioEngine;
  unlock: () => Promise<void>;
  setVolume: (track: AudioTrack, volume: number) => void;
  setMuted: (track: AudioTrack, muted: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const loadPrefs = (): VolumePrefs => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_VOLUME_PREFS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_VOLUME_PREFS };
    }
    return { ...DEFAULT_VOLUME_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_VOLUME_PREFS };
  }
};

const savePrefs = (prefs: VolumePrefs) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const engine = useMemo(() => getAudioEngine(), []);

  useEffect(() => {
    const prefs = loadPrefs();
    engine.setPrefs(prefs);
  }, [engine]);

  const unlock = useCallback(async () => {
    await unlockAudio();
  }, []);

  const setVolume = useCallback(
    (track: AudioTrack, volume: number) => {
      engine.setVolume(track, volume);
      savePrefs(engine.getPrefs());
    },
    [engine]
  );

  const setMuted = useCallback(
    (track: AudioTrack, muted: boolean) => {
      engine.setMuted(track, muted);
      savePrefs(engine.getPrefs());
    },
    [engine]
  );

  useEffect(() => {
    const onGesture = () => {
      void unlock();
    };

    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('keydown', onGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [unlock]);

  const value = useMemo(
    () => ({ engine, unlock, setVolume, setMuted }),
    [engine, unlock, setVolume, setMuted]
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
