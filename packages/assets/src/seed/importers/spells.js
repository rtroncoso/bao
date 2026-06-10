import path from 'path';
import fs from 'fs';
import { parseIniFile, readLatin1File, upsertSql } from '../lib/iniParser.js';

export const importSpells = ({ datsDir }) => {
  const filePath = path.join(datsDir, 'Hechizos.dat');
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;

  for (const [sectionName, fields] of Object.entries(sections)) {
    const match = sectionName.match(/^HECHIZO(\d+)$/i);
    if (!match) {
      continue;
    }

    const spellId = Number.parseInt(match[1], 10);
    const data = { ...fields };
    delete data.Nombre;
    delete data.Desc;

    statements.push(
      upsertSql(
        'spells',
        {
          id: spellId,
          name: fields.Nombre ?? '',
          description: fields.Desc ?? '',
          magicWords: fields.PalabrasMagicas ?? '',
          spellType: Number.parseInt(fields.Tipo ?? '0', 10),
          targetType: Number.parseInt(fields.Target ?? '0', 10),
          minSkill: Number.parseInt(fields.MinSkill ?? '0', 10),
          manaCost: Number.parseInt(fields.ManaRequerido ?? '0', 10),
          staminaCost: Number.parseInt(fields.StaRequerido ?? '0', 10),
          data: JSON.stringify(data),
        },
        ['id'],
      ),
    );
    count += 1;
  }

  return { statements, count, skipped: false };
};
