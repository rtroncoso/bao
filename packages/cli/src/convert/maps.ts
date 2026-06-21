import fs from "fs";
import path from "path";
import { createRequire } from "node:module";

import "../lib/registerCoreAliases.js";
import { loadInitData, loadTilesetResources } from "../lib/loadInit.js";
import {
  getMissingMapExtensions,
  isMapComplete,
  listMapIds,
  readMapFiles,
} from "../lib/mapFiles.js";
import type { ConvertMapsOptions } from "../types.js";
import {
  validateConvertedMaps,
  type ConvertMapsResult,
} from "./validateMapSpawns.js";

const require = createRequire(import.meta.url);

const { buildWorldsJson, computeBorderNeighbors } =
  require("@bao/core/loaders/maps/world") as {
    buildWorldsJson: (args: unknown) => unknown;
    computeBorderNeighbors: (tileExits: unknown) => unknown;
  };
const { convertLayersToTmx } =
  require("@bao/core/loaders/maps/tmx/converter") as {
    convertLayersToTmx: (args: unknown) => unknown;
  };
const { extractMapMeta } = require("@bao/core/loaders/maps/meta") as {
  extractMapMeta: (
    mapId: number,
    tiles: unknown
  ) => { tileExits: unknown; blockedTiles?: unknown; objects?: unknown[] };
};
const { getBinaryLayers, getBinaryTiles } =
  require("@bao/core/loaders/maps/binary") as {
    getBinaryLayers: (args: unknown) => unknown;
    getBinaryTiles: (args: unknown) => unknown;
  };
const { extractBlockedTilesFromLayers } =
  require("@bao/core/loaders/maps/blocking") as {
    extractBlockedTilesFromLayers: (layers: unknown) => unknown;
  };
const { parseMapAmbientSounds, parseMapDat } =
  require("@bao/core/loaders/maps/dat") as {
    parseMapAmbientSounds: (datFile: string) => unknown;
    parseMapDat: (datFile: string, mapId: number) => unknown;
  };

const updateManifest = (manifestPath: string, mapIds: number[]) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    maps?: Record<string, string>;
    worlds?: string;
  };
  manifest.maps = manifest.maps ?? {};

  for (const mapId of mapIds) {
    manifest.maps[String(mapId)] = `maps/${mapId}.json`;
  }

  if (!manifest.worlds) {
    manifest.worlds = "worlds/worlds.json";
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

const loadWorldOverrides = (overridesPath: string) => {
  if (!fs.existsSync(overridesPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(overridesPath, "utf8")) as Record<
    string,
    unknown
  >;
};

export const convertMaps = async (
  options: ConvertMapsOptions
): Promise<ConvertMapsResult> => {
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
    tilesetsType = "tilesets",
    validate = false,
    worlds = true,
  } = options;

  if (!inputDir || !initDir || !outputDir || !publicDir) {
    throw new Error(
      "convertMaps requires inputDir, initDir, outputDir, and publicDir"
    );
  }

  const requestedMapIds = all ? listMapIds(inputDir) : maps;
  if (!requestedMapIds.length) {
    throw new Error("No maps selected for conversion");
  }

  const skippedMapIds: number[] = [];
  const mapIds = requestedMapIds.filter((mapId) => {
    if (isMapComplete(inputDir, mapId)) {
      return true;
    }

    const missing = getMissingMapExtensions(inputDir, mapId).join(", .");
    console.warn(
      `[bao] skipping map ${mapId}: missing .${missing} in ${inputDir}`
    );
    skippedMapIds.push(mapId);
    return false;
  });

  if (!mapIds.length) {
    throw new Error("No maps with complete legacy .dat, .inf, and .map files");
  }

  const initData = loadInitData(initDir);
  const resources = loadTilesetResources(
    path.join(publicDir, "textures"),
    tilesetsType
  );

  const tileExitsByMap: Record<number, unknown> = {};
  const convertedMapIds: number[] = [];

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
      name: "Map",
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
    const overridesPath = path.join(publicDir, "worlds", "overrides.json");
    const allMapIds = listMapIds(inputDir).filter((id) =>
      fs.existsSync(path.join(outputDir, `${id}.meta.json`))
    );
    const worldsTileExits: Record<number, unknown> = { ...tileExitsByMap };
    for (const mapId of allMapIds) {
      if (worldsTileExits[mapId]) {
        continue;
      }
      const metaPath = path.join(outputDir, `${mapId}.meta.json`);
      const metaJson = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
        tileExits?: unknown;
      };
      worldsTileExits[mapId] = metaJson.tileExits ?? [];
    }

    const worldsJson = buildWorldsJson({
      mapIds: allMapIds.length ? allMapIds : convertedMapIds,
      tileExitsByMap: worldsTileExits,
      overrides: loadWorldOverrides(overridesPath),
    });

    if (!dryRun) {
      const worldsDir = path.join(publicDir, "worlds");
      fs.mkdirSync(worldsDir, { recursive: true });
      fs.writeFileSync(
        path.join(worldsDir, "worlds.json"),
        JSON.stringify(worldsJson, null, 2)
      );
    }
  }

  if (!dryRun) {
    updateManifest(path.join(publicDir, "manifest.json"), convertedMapIds);
  }

  if (skippedMapIds.length > 0) {
    console.warn(
      `[bao] skipped ${
        skippedMapIds.length
      } incomplete map(s): ${skippedMapIds.join(", ")}`
    );
  }

  let validationMismatches: Awaited<ReturnType<typeof validateConvertedMaps>> =
    [];

  if (validate && convertedMapIds.length > 0 && !dryRun) {
    validationMismatches = validateConvertedMaps({
      outputDir,
      mapIds: convertedMapIds,
      objects: initData.objects as Array<{
        id: number;
        type?: number;
        graphicId?: number;
      }>,
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

      throw new Error("Map spawn/bake validation failed");
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
