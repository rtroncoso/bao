import fs from 'fs';
import path from 'path';

import { requireCore } from './coreRequire.js';

const { getJsonGraphics } = requireCore('@bao/core/loaders/graphics/json');
const { MapObject } = requireCore('@bao/core/models/data/map/MapObject');

export const readJsonFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
};

export const loadInitData = (initDir) => {
  const graphics = getJsonGraphics(readJsonFile(path.join(initDir, 'graphics.json')));
  const objectsJson = readJsonFile(path.join(initDir, 'objects.json'));

  const objects = objectsJson.map((object) => {
    const graphic = graphics[object.graphicId] ?? null;
    return new MapObject({
      id: object.id,
      type: object.type,
      graphic,
    });
  });

  return {
    graphics,
    objects,
    animations: [],
  };
};

export const loadTilesetResources = (texturesDir, tilesetsType = 'tilesets', amount = 22) => {
  const resources = {};

  for (let index = 1; index <= amount; index += 1) {
    const jsonPath = path.join(texturesDir, `${tilesetsType}`, `${tilesetsType}-${index}.json`);
    if (!fs.existsSync(jsonPath)) {
      continue;
    }

    const source = `${tilesetsType}/${tilesetsType}-${index}.json`;
    resources[source] = {
      data: readJsonFile(jsonPath),
    };
  }

  return resources;
};
