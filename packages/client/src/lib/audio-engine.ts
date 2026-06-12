import { AudioEngine } from '@bao/audio';

let engine: AudioEngine | null = null;
let unlocked = false;

export const getAudioEngine = (): AudioEngine => {
  if (!engine) {
    engine = new AudioEngine();
    const base = process.env.NEXT_PUBLIC_BAO_ASSETS?.replace(/\/$/, '') ?? '';
    engine.setResolveUrl((relativePath) =>
      relativePath.startsWith('http')
        ? relativePath
        : `${base}/${relativePath.replace(/^\//, '')}`
    );
  }
  return engine;
};

export const getAssetsBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_BAO_ASSETS?.replace(/\/$/, '') ?? '';

/** Resumes AudioContext after a user gesture (safe to call multiple times). */
export const unlockAudio = async (): Promise<void> => {
  if (unlocked) {
    return;
  }
  await getAudioEngine().unlock();
  unlocked = true;
};
