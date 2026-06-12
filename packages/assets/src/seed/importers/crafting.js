import path from 'path';
import fs from 'fs';
import { parseIniFile, readLatin1File, upsertSql } from '../lib/iniParser.js';

const CRAFTING_FILES = [
  { fileName: 'ArmasHerrero.dat', profession: 'blacksmith_weapons', sectionPrefix: 'Arma' },
  { fileName: 'ArmadurasHerrero.dat', profession: 'blacksmith_armor', sectionPrefix: 'Armadura' },
  { fileName: 'ObjCarpintero.dat', profession: 'carpenter', sectionPrefix: 'OBJ' },
];

export const importCrafting = ({ datsDir }) => {
  const statements = [];
  let count = 0;
  let skipped = true;

  for (const { fileName, profession, sectionPrefix } of CRAFTING_FILES) {
    const filePath = path.join(datsDir, fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    skipped = false;
    const sections = parseIniFile(readLatin1File(filePath, fs));

    for (const [sectionName, fields] of Object.entries(sections)) {
      const match = sectionName.match(new RegExp(`^${sectionPrefix}(\\d+)$`, 'i'));
      if (!match) {
        continue;
      }

      const slot = Number.parseInt(match[1], 10);
      const objectId = Number.parseInt(fields.Index ?? fields.ObjIndex ?? '0', 10);
      if (!Number.isFinite(objectId)) {
        continue;
      }

      statements.push(
        upsertSql(
          'crafting_recipes',
          {
            profession,
            slot,
            objectId,
          },
          ['profession', 'slot'],
        ),
      );
      count += 1;
    }
  }

  return { statements, count, skipped };
};
