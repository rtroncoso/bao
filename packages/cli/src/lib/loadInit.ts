import fs from "fs";
import path from "path";

import { requireCore } from "./coreRequire.js";

const { getJsonGraphics } = requireCore("@bao/core/loaders/graphics/json") as {
  getJsonGraphics: (json: unknown) => Record<number, unknown>;
};
const { MapObject } = requireCore("@bao/core/models/data/map/MapObject") as {
  MapObject: new (args: { id: number; type: number; graphic: unknown }) => {
    id: number;
    type: number;
    graphic: unknown;
  };
};

export const readJsonFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as unknown;
};

export const loadInitData = (initDir: string) => {
  const graphics = getJsonGraphics(
    readJsonFile(path.join(initDir, "graphics.json"))
  );
  const objectsJson = readJsonFile(
    path.join(initDir, "objects.json")
  ) as Array<{
    id: number;
    type: number;
    graphicId: number;
  }>;

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
    animations: [] as unknown[],
  };
};

export const loadTilesetResources = (
  texturesDir: string,
  tilesetsType = "tilesets",
  amount = 22
) => {
  const resources: Record<string, { data: unknown }> = {};

  for (let index = 1; index <= amount; index += 1) {
    const jsonPath = path.join(
      texturesDir,
      `${tilesetsType}`,
      `${tilesetsType}-${index}.json`
    );
    if (!fs.existsSync(jsonPath)) {
      continue;
    }

    const source = `${tilesetsType}-${index}.json`;
    resources[source] = {
      data: readJsonFile(jsonPath),
    };
  }

  return resources;
};
