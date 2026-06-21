import fs from "fs";

import type { ConvertMapsOptions } from "../types.js";

const TILE_SIZE = 32;
const SERVER_RENDERED_TYPES = new Set([4, 6, 8]);

interface BakedSprite {
  tx: number;
  ty: number;
  graphicId: number;
}

interface MapLayer {
  type?: string;
  layers?: MapLayer[];
  objects?: Array<{
    type?: string;
    name?: string;
    x?: number;
    y?: number;
    properties?: Array<{ name: string; value: number }>;
  }>;
}

const collectBakedSprites = (
  layers: MapLayer[] | undefined,
  sprites: BakedSprite[] = []
) => {
  for (const layer of layers ?? []) {
    if (layer.type === "group") {
      collectBakedSprites(layer.layers, sprites);
    } else if (layer.objects) {
      for (const object of layer.objects) {
        if (object.type !== "sprite" && object.type !== "animation") {
          continue;
        }

        const offsetX =
          object.properties?.find?.((entry) => entry.name === "offsetx")
            ?.value ?? object.x;
        const offsetY =
          object.properties?.find?.((entry) => entry.name === "offsety")
            ?.value ?? object.y;
        const graphicId = Number.parseInt(object.name ?? "", 10);

        if (!Number.isFinite(graphicId) || offsetX == null || offsetY == null) {
          continue;
        }

        sprites.push({
          tx: Math.round(offsetX / TILE_SIZE),
          ty: Math.round(offsetY / TILE_SIZE),
          graphicId,
        });
      }
    }
  }

  return sprites;
};

export interface SpawnMismatch {
  mapId: number;
  objectId: number;
  spawnX: number;
  spawnY: number;
  bakedX: number;
  bakedY: number;
  deltaX: number;
  graphicId: number;
}

export const validateMapSpawnAlignment = ({
  mapId,
  mapJson,
  meta,
  objectsById,
}: {
  mapId: number;
  mapJson: { layers?: MapLayer[] };
  meta: { objects?: Array<{ objectId: number; x: number; y: number }> };
  objectsById: Map<number, { type?: number; graphicId?: number }>;
}) => {
  const mismatches: SpawnMismatch[] = [];
  const sprites = collectBakedSprites(mapJson.layers);
  const spawns = (meta.objects ?? []).filter((spawn) =>
    SERVER_RENDERED_TYPES.has(objectsById.get(spawn.objectId)?.type ?? -1)
  );

  for (const spawn of spawns) {
    const graphicId = objectsById.get(spawn.objectId)?.graphicId;
    if (graphicId == null) {
      continue;
    }

    for (const deltaX of [-4, 4]) {
      const baked = sprites.find(
        (sprite) =>
          sprite.graphicId === graphicId &&
          sprite.tx === spawn.x + deltaX &&
          sprite.ty === spawn.y
      );

      if (baked) {
        mismatches.push({
          mapId,
          objectId: spawn.objectId,
          spawnX: spawn.x,
          spawnY: spawn.y,
          bakedX: baked.tx,
          bakedY: baked.ty,
          deltaX,
          graphicId,
        });
      }
    }
  }

  return mismatches;
};

export const validateConvertedMaps = ({
  outputDir,
  mapIds,
  objects,
}: {
  outputDir: string;
  mapIds: number[];
  objects: Array<{ id: number; type?: number; graphicId?: number }>;
}) => {
  const objectsById = new Map(objects.map((object) => [object.id, object]));
  const mismatches: SpawnMismatch[] = [];

  for (const mapId of mapIds) {
    const mapPath = `${outputDir}/${mapId}.json`;
    const metaPath = `${outputDir}/${mapId}.meta.json`;

    if (!fs.existsSync(mapPath) || !fs.existsSync(metaPath)) {
      continue;
    }

    const mapJson = JSON.parse(fs.readFileSync(mapPath, "utf8")) as {
      layers?: MapLayer[];
    };
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
      objects?: Array<{ objectId: number; x: number; y: number }>;
    };

    mismatches.push(
      ...validateMapSpawnAlignment({
        mapId,
        mapJson,
        meta,
        objectsById,
      })
    );
  }

  return mismatches;
};

export interface ConvertMapsResult {
  converted: number[];
  skipped: number[];
  total: number;
  validationMismatches: SpawnMismatch[];
}

export type { ConvertMapsOptions };
