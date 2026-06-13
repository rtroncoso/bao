'use client';

import React, { useState } from 'react';

import { AudioTrack } from '@bao/audio';
import {
  Cog,
  gameOverlayTriggerClassName,
  Github,
  SettingsAction,
  SettingsFieldset,
  SettingsFooter,
  SettingsPanel,
  Slider
} from '@bao/ui';

import { useAudio } from '@bao/client/components/Audio';

const GITHUB_URL = 'https://github.com/rtroncoso/bao';

const AUDIO_TRACKS: Array<{ track: AudioTrack; label: string }> = [
  { track: 'music', label: 'Music' },
  { track: 'ambient', label: 'Ambience' },
  { track: 'sfx', label: 'SFX' }
];

export const GameSettingsPanel: React.FC = () => {
  const { prefs, setVolume } = useAudio();
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
      <button
        type="button"
        className={gameOverlayTriggerClassName(true)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="game-settings-panel"
        aria-label="Settings"
      >
        <Cog className="h-4 w-4" />
      </button>

      <SettingsPanel
        id="game-settings-panel"
        title="Settings"
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <SettingsFooter className="mt-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </SettingsFooter>
        }
      >
        <SettingsFieldset legend="Audio">
          {AUDIO_TRACKS.map(({ track, label }) => (
            <Slider
              key={track}
              variant="overlay"
              label={label}
              value={prefs[track]}
              onValueChange={(value) => setVolume(track, value)}
            />
          ))}
        </SettingsFieldset>

        <div className="space-y-2">
          <SettingsAction type="button" variant="outline" disabled>
            Keybindings
          </SettingsAction>
          <SettingsAction type="button" variant="outline" disabled>
            Exit
          </SettingsAction>
        </div>
      </SettingsPanel>
    </div>
  );
};
