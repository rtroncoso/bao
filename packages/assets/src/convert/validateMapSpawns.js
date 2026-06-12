import fs from 'fs';

const TILE_SIZE = 32;
const SERVER_RENDERED_TYPES = new Set([4, 6, 8]);

const collectBakedSprites = (layers, sprites = []) => {
  for (const layer of layers ?? []) {
    if (layer.type === 'group') {
      collectBakedSprites(layer.layers, sprites);
    } else if (layer.objects) {
      for (const object of layer.objects) {
        if (object.type !== 'sprite' && object.type !== 'animation') {
          continue;
        }

        const offsetX = object.properties?.find?.((entry) => entry.name === 'offsetx')?.value ?? object.x;
        const offsetY = object.properties?.find?.((entry) => entry.name === 'offsety')?.value ?? object.y;
        const graphicId = Number.parseInt(object.name, 10);

        if (!Number.isFinite(graphicId)) {
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

/**
 * Detects legacy +4 X offset between server spawns and baked sprites.
 */
export const validateMapSpawnAlignment = ({
  mapId,
  mapJson,
  meta,
  objectsById,
}) => {
  const mismatches = [];
  const sprites = collectBakedSprites(mapJson.layers);
  const spawns = (meta.objects ?? []).filter((spawn) =>
    SERVER_RENDERED_TYPES.has(objectsById.get(spawn.objectId)?.type)
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
}) => {
  const objectsById = new Map(objects.map((object) => [object.id, object]));
  const mismatches = [];

  for (const mapId of mapIds) {
    const mapPath = `${outputDir}/${mapId}.json`;
    const metaPath = `${outputDir}/${mapId}.meta.json`;

    if (!fs.existsSync(mapPath) || !fs.existsSync(metaPath)) {
      continue;
    }

    const mapJson = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

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
