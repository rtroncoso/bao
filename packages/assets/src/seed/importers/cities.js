import path from 'path';
import fs from 'fs';
import { parseIniFile, readLatin1File, upsertSql } from '../lib/iniParser.js';

export const importCities = ({ datsDir }) => {
  const filePath = path.join(datsDir, 'Ciudades.Dat');
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;
  let cityId = 1;

  for (const [name, fields] of Object.entries(sections)) {
    if (name === 'INIT') {
      continue;
    }

    statements.push(
      upsertSql(
        'cities',
        {
          id: cityId,
          name,
          mapId: Number.parseInt(fields.MAPA ?? fields.Mapa ?? '0', 10),
          x: Number.parseInt(fields.X ?? '0', 10),
          y: Number.parseInt(fields.Y ?? '0', 10),
        },
        ['id'],
      ),
    );
    cityId += 1;
    count += 1;
  }

  return { statements, count, skipped: false };
};
