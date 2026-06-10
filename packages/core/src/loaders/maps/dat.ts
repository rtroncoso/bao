import { createMapInfo, MapInfo } from '@bao/core/models';

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
