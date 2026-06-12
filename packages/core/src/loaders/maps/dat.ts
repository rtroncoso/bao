import { AO_AMBIENT_INTERVAL_MS } from '../../constants/audio';
import {
  createMapAmbientConfig,
  createMapInfo,
  MapAmbientConfig,
  MapAmbientEntry,
  MapInfo
} from '../../models';

const parseIniValue = (value: string): string => value.trim();

const parseBoolean = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
};

const parseNumber = (value: string): number => {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Parses AO map metadata from MapaN.dat INI content.
 */
export const parseMapDat = (datFile: string, mapId?: number): MapInfo => {
  const lines = datFile.split(/\r?\n/);
  let section = '';
  const values: Record<string, string> = {};
  let sectionId = mapId ?? 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("'") || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].toUpperCase();
      const mapSectionMatch = section.match(/^MAPA(\d+)$/);
      if (mapSectionMatch) {
        sectionId = Number.parseInt(mapSectionMatch[1], 10);
      }
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1 || !section) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = parseIniValue(line.slice(separatorIndex + 1));
    values[key.toLowerCase()] = value;
  }

  return createMapInfo({
    id: sectionId,
    name: values.name ?? '',
    musicNum: parseNumber(values.musicnum ?? '0'),
    magiaSinEfecto: parseBoolean(values.magiasinefecto ?? '0'),
    noEncriptarMP: parseBoolean(values.noencriptarmp ?? '0'),
    terreno: values.terreno ?? '',
    zona: values.zona ?? '',
    restringir: values.restringir ?? 'No',
    backup: parseBoolean(values.backup ?? '0'),
    pk: parseBoolean(values.pk ?? '0'),
  });
};

/**
 * Parses AO map ambient sound config from MapaN.dat [SONIDOS] sections.
 */
export const parseMapAmbientSounds = (
  datFile: string
): MapAmbientConfig | null => {
  const lines = datFile.split(/\r?\n/);
  let section = '';
  let cantidad = 0;
  const entries: MapAmbientEntry[] = [];
  let currentEntry: Partial<MapAmbientEntry> = {};

  const flushEntry = () => {
    if (currentEntry.sfxId !== undefined) {
      entries.push({
        sfxId: currentEntry.sfxId,
        probability: currentEntry.probability ?? 0,
        flags: currentEntry.flags ?? 1
      });
    }
    currentEntry = {};
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("'") || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\]$/i);
    if (sectionMatch) {
      flushEntry();
      section = sectionMatch[1].toUpperCase();
      if (section === 'SONIDOS') {
        cantidad = 0;
        entries.length = 0;
      }
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = parseIniValue(line.slice(separatorIndex + 1));

    if (section === 'SONIDOS' && key === 'cantidad') {
      cantidad = parseNumber(value);
      continue;
    }

    if (/^SONIDO\d+$/.test(section)) {
      if (key === 'sonido') {
        currentEntry.sfxId = parseNumber(value);
      } else if (key === 'probabilidad') {
        currentEntry.probability = parseNumber(value);
      } else if (key === 'flags') {
        currentEntry.flags = parseNumber(value);
      }
    }
  }

  flushEntry();

  if (cantidad === 0 && entries.length === 0) {
    return null;
  }

  return createMapAmbientConfig({
    intervalMs: AO_AMBIENT_INTERVAL_MS,
    entries: entries.slice(0, cantidad || entries.length)
  });
};
