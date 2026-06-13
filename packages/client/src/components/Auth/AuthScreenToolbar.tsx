'use client';

import React from 'react';

import { useAudio } from '@bao/client/components/Audio';
import {
  cn,
  gameOverlayTriggerClassName,
  Github,
  Volume2,
  VolumeX
} from '@bao/ui';

const GITHUB_URL = 'https://github.com/rtroncoso/bao';
const triggerClassName = cn(
  'pointer-events-auto',
  gameOverlayTriggerClassName(true)
);

export const AuthScreenToolbar: React.FC = () => {
  const { isMasterMuted, toggleMasterMute } = useAudio();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-20 flex items-center gap-2">
      <button
        type="button"
        className={triggerClassName}
        onClick={toggleMasterMute}
        aria-label={isMasterMuted ? 'Unmute audio' : 'Mute audio'}
        aria-pressed={isMasterMuted}
      >
        {isMasterMuted ? (
          <VolumeX className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
      </button>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={triggerClassName}
        aria-label="GitHub repository"
      >
        <Github className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
};
