import { AO_AMBIENT_INTERVAL_MS } from '../../../constants/audio';

export interface MapAmbientEntry {
  sfxId: number;
  probability: number;
  /** 1 = clear weather, 0 = rain (AO Flags). */
  flags: number;
}

export interface MapAmbientConfig {
  intervalMs: number;
  entries: MapAmbientEntry[];
}

export interface MapAudioOverride {
  mapId: number;
  ambientSounds: MapAmbientConfig | null;
}

export const createMapAmbientConfig = (
  partial: Partial<MapAmbientConfig> & { entries: MapAmbientEntry[] }
): MapAmbientConfig => ({
  intervalMs: partial.intervalMs ?? AO_AMBIENT_INTERVAL_MS,
  entries: partial.entries
});
