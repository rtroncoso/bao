export type AudioTrack = 'music' | 'ambient' | 'sfx' | 'ui';

export interface PlayMusicOptions {
  loop?: boolean;
  fadeMs?: number;
}

export interface PreloadManifest {
  music?: Record<string, string>;
  sfx?: Record<string, string>;
}

export type AudioCatalogKind = 'music' | 'sfx';

export interface AudioPrefetchEntry {
  id: string;
  kind: AudioCatalogKind;
}

export interface VolumePrefs {
  music: number;
  ambient: number;
  sfx: number;
  ui: number;
  muted: Partial<Record<AudioTrack, boolean>>;
}

export const DEFAULT_VOLUME_PREFS: VolumePrefs = {
  music: 0.7,
  ambient: 0.6,
  sfx: 0.8,
  ui: 0.5,
  muted: {}
};
