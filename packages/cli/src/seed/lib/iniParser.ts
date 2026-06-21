import type { PathLike } from "fs";
import type { ImporterResult, SeedImporterContext } from "../../types.js";

export type IniSections = Record<string, Record<string, string>>;

export const parseIniFile = (content: string): IniSections => {
  const sections: IniSections = {};
  let currentSection = "";

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (
      !line ||
      line.startsWith("'") ||
      line.startsWith("#") ||
      line.startsWith(";")
    ) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\](?:\s.*)?$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = sections[currentSection] ?? {};
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1 || !currentSection) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/\s+'.*$/, "");
    sections[currentSection][key] = value;
  }

  return sections;
};

export const readLatin1File = (
  filePath: PathLike,
  fsModule: { readFileSync: (path: PathLike, encoding: "latin1") => string }
) => fsModule.readFileSync(filePath, "latin1");

export const sqlValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "0";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
};

export const upsertSql = (
  table: string,
  row: Record<string, unknown>,
  keys: string[]
): string => {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlValue(row[column]));
  const updates = columns
    .filter((column) => !keys.includes(column))
    .map((column) => `\`${column}\`=VALUES(\`${column}\`)`)
    .join(", ");

  return `INSERT INTO \`${table}\` (${columns
    .map((column) => `\`${column}\``)
    .join(", ")}) VALUES (${values.join(
    ", "
  )}) ON DUPLICATE KEY UPDATE ${updates};`;
};

export const parseBool = (value: unknown): boolean => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "si" ||
    normalized === "sí"
  );
};

export const parseCompositeItem = (value: unknown) => {
  const [objectIdPart, amountPart] = String(value).split("-");
  const objectId = Number.parseInt(objectIdPart, 10);
  const amountRaw = amountPart?.trim();
  const amount = amountRaw ? Number.parseInt(amountRaw, 10) : 1;

  return {
    objectId: Number.isFinite(objectId) ? objectId : 0,
    amount: Number.isFinite(amount) ? amount : 1,
  };
};

export type ImporterFn = (context: SeedImporterContext) => ImporterResult;
