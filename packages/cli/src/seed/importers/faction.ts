import type { ImporterResult, SeedImporterContext } from "../../types.js";
import path from "path";
import fs from "fs";
import { parseIniFile, readLatin1File, upsertSql } from "../lib/iniParser.js";

const FIELD_PATTERN = /^Def(Min|Med|Alta)(Army|Caos)(Alto|Bajo)$/i;

const TIER_MAP = {
  Min: "min",
  Med: "med",
  Alta: "alta",
};

const FACTION_MAP = {
  Army: "army",
  Caos: "caos",
};

const GENDER_MAP = {
  Alto: "alto",
  Bajo: "bajo",
};

export const importFaction = ({
  datsDir,
}: SeedImporterContext): ImporterResult => {
  const filePath = path.join(datsDir, "ArmadurasFaccionarias.dat");
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;

  for (const [sectionName, fields] of Object.entries(sections)) {
    const match = sectionName.match(/^CLASE(\d+)$/i);
    if (!match) {
      continue;
    }

    const classId = Number.parseInt(match[1], 10);

    for (const [fieldName, rawValue] of Object.entries(fields)) {
      const fieldMatch = fieldName.match(FIELD_PATTERN);
      if (!fieldMatch) {
        continue;
      }

      const objectId = Number.parseInt(rawValue, 10);
      if (!Number.isFinite(objectId)) {
        continue;
      }

      statements.push(
        upsertSql(
          "faction_armor_map",
          {
            classId,
            tier: TIER_MAP[fieldMatch[1] as keyof typeof TIER_MAP],
            faction: FACTION_MAP[fieldMatch[2] as keyof typeof FACTION_MAP],
            gender: GENDER_MAP[fieldMatch[3] as keyof typeof GENDER_MAP],
            objectId,
          },
          ["classId", "tier", "faction", "gender"]
        )
      );
      count += 1;
    }
  }

  return { statements, count, skipped: false };
};
