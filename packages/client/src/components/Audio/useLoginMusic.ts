import { AO_MUSIC_LOGIN } from '@bao/core/constants/audio';

import { getAudioEngine, unlockAudio } from '@bao/client/lib/audio-engine';

export const useLoginMusic = () => {
  return async () => {
    await unlockAudio();
    const engine = getAudioEngine();
    await engine.playMusic(AO_MUSIC_LOGIN, { fadeMs: 800, loop: true });
  };
};
