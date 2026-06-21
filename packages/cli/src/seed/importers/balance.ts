import type { ImporterResult, SeedImporterContext } from "../../types.js";
import path from "path";
import fs from "fs";
import { parseIniFile, readLatin1File, upsertSql } from "../lib/iniParser.js";

export const importBalance = ({
  datsDir,
}: SeedImporterContext): ImporterResult => {
  const filePath = path.join(datsDir, "Balance.dat");
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;

  for (const [category, fields] of Object.entries(sections)) {
    if (category === "INIT") {
      continue;
    }

    for (const [key, value] of Object.entries(fields)) {
      const numeric = Number.parseFloat(String(value).replace("+", ""));
      if (Number.isNaN(numeric)) {
        continue;
      }

      statements.push(
        upsertSql(
          "game_balance",
          {
            category,
            key,
            value: numeric,
          },
          ["category", "key"]
        )
      );
      count += 1;
    }
  }

  return { statements, count, skipped: false };
};
