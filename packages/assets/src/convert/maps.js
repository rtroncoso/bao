import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

import '../lib/registerCoreAliases.js';
import { loadInitData, loadTilesetResources } from '../lib/loadInit.js';
import {
  getMissingMapExtensions,
  isMapComplete,
  listMapIds,
  readMapFiles,
} from '../lib/mapFiles.js';

const require = createRequire(import.meta.url);

const { buildWorldsJson, computeBorderNeighbors } = require(
  '@bao/core/loaders/maps/world'
);
const { convertLayersToTmx } = require('@bao/core/loaders/maps/tmx/converter');
const { extractMapMeta } = require('@bao/core/loaders/maps/meta');
const { getBinaryLayers, getBinaryTiles } = require('@bao/core/loaders/maps/binary');
const { extractBlockedTilesFromLayers } = require('@bao/core/loaders/maps/blocking');
const { parseMapAmbientSounds, parseMapDat } = require('@bao/core/loaders/maps/dat');
const { validateConvertedMaps } = require('./validateMapSpawns.js');

const updateManifest = (manifestPath, mapIds) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.maps = manifest.maps ?? {};

  for (const mapId of mapIds) {
    manifest.maps[String(mapId)] = `maps/${mapId}.json`;
  }

  if (!manifest.worlds) {
    manifest.worlds = 'worlds/worlds.json';
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

const loadWorldOverrides = (overridesPath) => {
  if (!fs.existsSync(overridesPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
};

export const convertMaps = async (options) => {
  const {
    all = false,
    debug = false,
    dryRun = false,
    inputDir,
    initDir,
    maps = [],
    meta = true,
    noCrop = false,
    outputDir,
    publicDir,
    tilesetsType = 'tilesets',
    validate = false,
    worlds = true,
  } = options;

  const requestedMapIds = all ? listMapIds(inputDir) : maps;
  if (!requestedMapIds.length) {
    throw new Error('No maps selected for conversion');
  }

  const skippedMapIds = [];
  const mapIds = requestedMapIds.filter((mapId) => {
    if (isMapComplete(inputDir, mapId)) {
      return true;
    }

    const missing = getMissingMapExtensions(inputDir, mapId).join(', .');
    console.warn(
      `[bao] skipping map ${mapId}: missing .${missing} in ${inputDir}`
    );
    skippedMapIds.push(mapId);
    return false;
  });

  if (!mapIds.length) {
    throw new Error('No maps with complete legacy .dat, .inf, and .map files');
  }

  const initData = loadInitData(initDir);
  const resources = loadTilesetResources(
    path.join(publicDir, 'textures'),
    tilesetsType
  );

  const tileExitsByMap = {};
  const convertedMapIds = [];

  for (const mapId of mapIds) {
    if (debug) {
      console.log(`[bao] converting map ${mapId}`);
    }

    const { datFile, infFile, mapFile } = readMapFiles(inputDir, mapId);
    const mapInfo = parseMapDat(datFile, mapId);
    const ambientSounds = parseMapAmbientSounds(datFile);
    const tiles = getBinaryTiles({
      infFile,
      mapFile,
      translateExits: true,
    });

    const mapMeta = extractMapMeta(mapId, tiles);
    tileExitsByMap[mapId] = mapMeta.tileExits;

    const layers = getBinaryLayers({
      animations: initData.animations,
      datFile,
      graphics: initData.graphics,
      infFile,
      mapFile,
      objects: initData.objects,
    });

    mapMeta.blockedTiles = extractBlockedTilesFromLayers(layers);

    const borderNeighbors = computeBorderNeighbors(mapMeta.tileExits);

    const tmx = convertLayersToTmx({
      borderNeighbors,
      clientOnly: true,
      crop: !noCrop,
      layers,
      name: 'Map',
      number: mapId,
      resources,
      tilesetsType,
    });

    if (!dryRun) {
      const outputPath = path.join(outputDir, `${mapId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(tmx));

      if (meta) {
        const metaPath = path.join(outputDir, `${mapId}.meta.json`);
        fs.writeFileSync(
          metaPath,
          JSON.stringify(
            {
              ...mapMeta,
              info: mapInfo,
              ambientSounds,
            },
            null,
            2
          )
        );
      }
    }

    convertedMapIds.push(mapId);
  }

  if (worlds && convertedMapIds.length > 0) {
    const overridesPath = path.join(publicDir, 'worlds', 'overrides.json');
    const allMapIds = listMapIds(inputDir).filter((id) =>
      fs.existsSync(path.join(outputDir, `${id}.meta.json`))
    );
    const worldsTileExits = { ...tileExitsByMap };
    for (const mapId of allMapIds) {
      if (worldsTileExits[mapId]) {
        continue;
      }
      const metaPath = path.join(outputDir, `${mapId}.meta.json`);
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      worldsTileExits[mapId] = meta.tileExits ?? [];
    }

    const worldsJson = buildWorldsJson({
      mapIds: allMapIds.length ? allMapIds : convertedMapIds,
      tileExitsByMap: worldsTileExits,
      overrides: loadWorldOverrides(overridesPath),
    });

    if (!dryRun) {
      const worldsDir = path.join(publicDir, 'worlds');
      fs.mkdirSync(worldsDir, { recursive: true });
      fs.writeFileSync(
        path.join(worldsDir, 'worlds.json'),
        JSON.stringify(worldsJson, null, 2)
      );
    }
  }

  if (!dryRun) {
    updateManifest(path.join(publicDir, 'manifest.json'), convertedMapIds);
  }

  if (skippedMapIds.length > 0) {
    console.warn(
      `[bao] skipped ${skippedMapIds.length} incomplete map(s): ${skippedMapIds.join(', ')}`
    );
  }

  let validationMismatches = [];

  if (validate && convertedMapIds.length > 0 && !dryRun) {
    validationMismatches = validateConvertedMaps({
      outputDir,
      mapIds: convertedMapIds,
      objects: initData.objects,
    });

    if (validationMismatches.length > 0) {
      console.error(
        `[bao] spawn/bake alignment failed for ${validationMismatches.length} server object(s):`
      );

      for (const mismatch of validationMismatches.slice(0, 20)) {
        console.error(
          `  map ${mismatch.mapId} object ${mismatch.objectId} at (${mismatch.spawnX},${mismatch.spawnY}) — baked sprite at (${mismatch.bakedX},${mismatch.bakedY}), deltaX=${mismatch.deltaX}`
        );
      }

      if (validationMismatches.length > 20) {
        console.error(`  ... and ${validationMismatches.length - 20} more`);
      }

      throw new Error('Map spawn/bake validation failed');
    }

    console.log(
      `[bao] validated spawn/bake alignment for ${convertedMapIds.length} map(s)`
    );
  }

  return {
    converted: convertedMapIds,
    skipped: skippedMapIds,
    total: convertedMapIds.length,
    validationMismatches,
  };
};
