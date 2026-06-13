import {
  MapAmbientConfig,
  MapAmbientEntry,
  MapAudioOverride
} from '@bao/core/models';

import { getAssetsBaseUrl } from '@bao/client/lib/audio-engine';

const ambientConfigCache = new Map<string, Promise<MapAmbientConfig | null>>();

export const pickAmbientEntry = (
  entries: MapAmbientEntry[]
): MapAmbientEntry | null => {
  if (!entries.length) {
    return null;
  }

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const entry of entries) {
    cumulative += entry.probability;
    if (roll <= cumulative) {
      return entry;
    }
  }

  return entries[entries.length - 1] ?? null;
};

export const loadMapAmbientConfig = async (
  mapId: number,
  overridesBase: string | undefined,
  metaPath: string | undefined
): Promise<MapAmbientConfig | null> => {
  const cacheKey = `${mapId}:${overridesBase ?? ''}:${metaPath ?? ''}`;
  const cached = ambientConfigCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = fetchMapAmbientConfig(mapId, overridesBase, metaPath);
  ambientConfigCache.set(cacheKey, pending);
  return pending;
};

const fetchMapAmbientConfig = async (
  mapId: number,
  overridesBase: string | undefined,
  metaPath: string | undefined
): Promise<MapAmbientConfig | null> => {
  const base = getAssetsBaseUrl();

  if (overridesBase) {
    const overrideUrl = `${base}/${overridesBase.replace(
      /\/$/,
      ''
    )}/${mapId}.json`;
    try {
      const response = await fetch(overrideUrl);
      if (response.ok) {
        const override = (await response.json()) as MapAudioOverride;
        if (override.ambientSounds) {
          return override.ambientSounds;
        }
      }
    } catch {
      // fall through to meta
    }
  }

  if (!metaPath) {
    return null;
  }

  const metaUrl = `${base}/${metaPath.replace(/\.json$/, '.meta.json')}`;
  try {
    const response = await fetch(metaUrl);
    if (!response.ok) {
      return null;
    }
    const meta = await response.json();
    return meta.ambientSounds ?? null;
  } catch {
    return null;
  }
};
