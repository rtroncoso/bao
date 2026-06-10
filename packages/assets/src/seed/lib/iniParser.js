export const parseIniFile = (content) => {
  const sections = {};
  let currentSection = '';

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("'") || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\](?:\s.*)?$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = sections[currentSection] ?? {};
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1 || !currentSection) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/\s+'.*$/, '');
    sections[currentSection][key] = value;
  }

  return sections;
};

export const readLatin1File = (filePath, fs) => fs.readFileSync(filePath, 'latin1');

export const sqlValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
};

export const upsertSql = (table, row, keys) => {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlValue(row[column]));
  const updates = columns
    .filter((column) => !keys.includes(column))
    .map((column) => `\`${column}\`=VALUES(\`${column}\`)`)
    .join(', ');

  return `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${values.join(', ')}) ON DUPLICATE KEY UPDATE ${updates};`;
};

export const parseBool = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
};

export const parseCompositeItem = (value) => {
  const [objectId, amount] = String(value).split('-');
  return {
    objectId: Number.parseInt(objectId, 10),
    amount: Number.parseInt(amount ?? '1', 10),
  };
};
