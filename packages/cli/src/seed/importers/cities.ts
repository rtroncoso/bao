import type { ImporterResult, SeedImporterContext } from "../../types.js";
import path from "path";
import fs from "fs";
import { createRequire } from "node:module";

import "../../lib/registerCoreAliases.js";
import { parseIniFile, readLatin1File, upsertSql } from "../lib/iniParser.js";

const require = createRequire(import.meta.url);
const { toWorldCoords } = require("@bao/core/loaders/maps/coords");

export const importCities = ({
  datsDir,
}: SeedImporterContext): ImporterResult => {
  const filePath = path.join(datsDir, "Ciudades.Dat");
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;
  let cityId = 1;

  for (const [name, fields] of Object.entries(sections)) {
    if (name === "INIT") {
      continue;
    }

    const aoX = Number.parseInt(fields.X ?? "0", 10);
    const aoY = Number.parseInt(fields.Y ?? "0", 10);
    const { x, y } = toWorldCoords(aoX, aoY);

    statements.push(
      upsertSql(
        "cities",
        {
          id: cityId,
          name,
          mapId: Number.parseInt(fields.MAPA ?? fields.Mapa ?? "0", 10),
          x,
          y,
        },
        ["id"]
      )
    );
    cityId += 1;
    count += 1;
  }

  return { statements, count, skipped: false };
};
