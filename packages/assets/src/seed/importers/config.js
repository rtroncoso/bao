import path from 'path';
import fs from 'fs';
import { parseIniFile, readLatin1File, sqlValue, upsertSql } from '../lib/iniParser.js';

const parseMotdColor = (line) => {
  const match = String(line).match(/~(.*)$/);
  if (!match) {
    return null;
  }

  const parts = match[1].split('~').filter(Boolean).map((value) => Number.parseInt(value, 10));
  if (parts.length < 3) {
    return null;
  }

  return JSON.stringify({
    r: parts[0],
    g: parts[1],
    b: parts[2],
    bold: parts[3] === 1,
    italic: parts[4] === 1,
  });
};

export const importConfig = ({ datsDir }) => {
  const statements = [];
  let count = 0;
  let skipped = true;

  const motdPath = path.join(datsDir, 'Motd.ini');
  if (fs.existsSync(motdPath)) {
    skipped = false;
    const sections = parseIniFile(readLatin1File(motdPath, fs));
    const motd = sections.MOTD ?? sections.Motd ?? {};
    let lineOrder = 1;

    for (const [key, value] of Object.entries(motd)) {
      if (!/^Line/i.test(key)) {
        continue;
      }

      const text = String(value).replace(/~.*$/, '').trim();
      statements.push(
        upsertSql(
          'motd_lines',
          {
            lineOrder,
            text,
            colorData: parseMotdColor(value),
          },
          ['lineOrder'],
        ),
      );
      lineOrder += 1;
      count += 1;
    }
  }

  const helpPath = path.join(datsDir, 'Help.dat');
  if (fs.existsSync(helpPath)) {
    skipped = false;
    const sections = parseIniFile(readLatin1File(helpPath, fs));
    const help = sections.Help ?? {};
    let lineOrder = 1;

    for (const [key, value] of Object.entries(help)) {
      if (!/^Line/i.test(key)) {
        continue;
      }

      statements.push(
        upsertSql(
          'help_lines',
          {
            lineOrder,
            text: value,
          },
          ['lineOrder'],
        ),
      );
      lineOrder += 1;
      count += 1;
    }
  }

  const forbiddenPath = path.join(datsDir, 'NombresInvalidos.txt');
  if (fs.existsSync(forbiddenPath)) {
    skipped = false;
    const lines = fs.readFileSync(forbiddenPath, 'latin1').split(/\r?\n/);

    for (const rawLine of lines) {
      const name = rawLine.trim();
      if (!name) {
        continue;
      }

      statements.push(
        `INSERT INTO \`forbidden_names\` (\`name\`) VALUES (${sqlValue(name)}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`,
      );
      count += 1;
    }
  }

  const invokarPath = path.join(datsDir, 'Invokar.dat');
  if (fs.existsSync(invokarPath)) {
    skipped = false;
    const sections = parseIniFile(readLatin1File(invokarPath, fs));
    const list = sections.LIST ?? sections.List ?? sections;
    let slot = 1;

    while (list[`NI${slot}`]) {
      const npcId = Number.parseInt(list[`NI${slot}`], 10);
      const displayName = list[`NN${slot}`] ?? '';
      if (Number.isFinite(npcId)) {
        statements.push(
          upsertSql(
            'gm_summon_npcs',
            {
              slot,
              npcId,
              displayName,
            },
            ['slot'],
          ),
        );
        count += 1;
      }
      slot += 1;
    }
  }

  return { statements, count, skipped };
};
