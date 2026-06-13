'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AudioEngine,
  AudioTrack,
  DEFAULT_VOLUME_PREFS,
  VolumePrefs
} from '@bao/audio';

import {
  getAssetsBaseUrl,
  getAudioEngine,
  unlockAudio
} from '@bao/client/lib/audio-engine';

const STORAGE_KEY = 'bao.audio.prefs';

interface AudioContextValue {
  engine: AudioEngine;
  prefs: VolumePrefs;
  unlock: () => Promise<boolean>;
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

const hasAudioCatalog = (manifest: {
  audio?: { music?: Record<string, string>; sfx?: Record<string, string> };
}) => Boolean(manifest.audio?.music || manifest.audio?.sfx);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const engine = useMemo(() => getAudioEngine(), []);
  const [prefs, setPrefs] = useState<VolumePrefs>(() => loadPrefs());

  useEffect(() => {
    engine.setPrefs(prefs);
  }, [engine, prefs]);

  useEffect(() => {
    const base = getAssetsBaseUrl();
    if (!base) {
      console.warn('[audio] NEXT_PUBLIC_BAO_ASSETS is not set');
      return;
    }

    void fetch(`${base}/manifest.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest) => {
        if (!manifest || !hasAudioCatalog(manifest)) {
          console.warn(
            '[audio] manifest has no audio paths — run `npx bao convert audio` and deploy assets'
          );
          return;
        }

        engine.registerManifest({
          music: manifest.audio.music,
          sfx: manifest.audio.sfx
        });
      })
      .catch(() => undefined);
  }, [engine]);

  const unlock = useCallback(async () => unlockAudio(), []);

  const setVolume = useCallback(
    (track: AudioTrack, volume: number) => {
      engine.setVolume(track, volume);
      const next = engine.getPrefs();
      setPrefs(next);
      savePrefs(next);
    },
    [engine]
  );

  const setMuted = useCallback(
    (track: AudioTrack, muted: boolean) => {
      engine.setMuted(track, muted);
      const next = engine.getPrefs();
      setPrefs(next);
      savePrefs(next);
    },
    [engine]
  );

  useEffect(() => {
    const onGesture = () => {
      void unlock();
    };

    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [unlock]);

  const value = useMemo(
    () => ({ engine, prefs, unlock, setVolume, setMuted }),
    [engine, prefs, unlock, setVolume, setMuted]
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
