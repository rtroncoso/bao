import fs from 'fs';
import path from 'path';

const MAP_FILE_REGEX = /^mapa(\d+)\.(dat|inf|map)$/i;

export const listMapIds = (inputDir) => {
  const mapIds = new Set();

  for (const fileName of fs.readdirSync(inputDir)) {
    const match = fileName.match(MAP_FILE_REGEX);
    if (match && match[2].toLowerCase() === 'map') {
      mapIds.add(Number.parseInt(match[1], 10));
    }
  }

  return [...mapIds].sort((a, b) => a - b);
};

export const resolveMapFile = (inputDir, mapId, extension) => {
  const candidates = [
    `Mapa${mapId}.${extension}`,
    `mapa${mapId}.${extension}`,
  ];

  for (const candidate of candidates) {
    const filePath = path.join(inputDir, candidate);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
};

export const getMissingMapExtensions = (inputDir, mapId) => {
  const missing = [];

  for (const extension of ['dat', 'inf', 'map']) {
    if (!resolveMapFile(inputDir, mapId, extension)) {
      missing.push(extension);
    }
  }

  return missing;
};

export const isMapComplete = (inputDir, mapId) =>
  getMissingMapExtensions(inputDir, mapId).length === 0;

export const listCompleteMapIds = (inputDir) =>
  listMapIds(inputDir).filter((mapId) => isMapComplete(inputDir, mapId));

export const readMapFiles = (inputDir, mapId) => {
  const datPath = resolveMapFile(inputDir, mapId, 'dat');
  const infPath = resolveMapFile(inputDir, mapId, 'inf');
  const mapPath = resolveMapFile(inputDir, mapId, 'map');

  if (!datPath || !infPath || !mapPath) {
    throw new Error(`Missing legacy map files for map ${mapId} in ${inputDir}`);
  }

  return {
    datFile: fs.readFileSync(datPath, 'latin1'),
    infFile: new Uint8Array(fs.readFileSync(infPath)),
    mapFile: new Uint8Array(fs.readFileSync(mapPath)),
  };
};
