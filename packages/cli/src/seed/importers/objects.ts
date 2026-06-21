import path from "path";
import fs from "fs";
import type { ImporterResult, SeedImporterContext } from "../../types.js";
import { parseIniFile, readLatin1File, upsertSql } from "../lib/iniParser.js";
import {
  ATTRIBUTE_IDS,
  BASE_OBJECT_FIELDS,
  CLASS_PROHIBITION_PREFIX,
  FIELD_TO_ATTRIBUTE,
} from "../lib/attributes.js";
import { resolveClassId } from "../lib/classes.js";

export const importObjects = ({
  datsDir,
  debug,
}: SeedImporterContext): ImporterResult => {
  const filePath = path.join(datsDir, "obj.dat");
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;

  for (const [sectionName, fields] of Object.entries(sections)) {
    const match = sectionName.match(/^OBJ(\d+)$/i);
    if (!match) {
      continue;
    }

    const objectId = Number.parseInt(match[1], 10);
    const name = fields.Name ?? `Object ${objectId}`;
    const objectTypeId = Number.parseInt(fields.ObjType ?? "0", 10);
    const graphicId = Number.parseInt(fields.GrhIndex ?? "0", 10);
    const description = fields.Desc ?? fields.Description ?? null;

    statements.push(
      upsertSql(
        "objects",
        {
          id: objectId,
          name,
          object_typeId: objectTypeId,
          graphicId,
          description,
        },
        ["id"]
      )
    );

    for (const [fieldName, rawValue] of Object.entries(fields)) {
      if (BASE_OBJECT_FIELDS.has(fieldName)) {
        continue;
      }

      if (fieldName.startsWith(CLASS_PROHIBITION_PREFIX)) {
        continue;
      }

      const attributeName =
        FIELD_TO_ATTRIBUTE[fieldName as keyof typeof FIELD_TO_ATTRIBUTE];
      if (!attributeName) {
        if (debug) {
          console.warn(
            `[objects] Unmapped field ${fieldName} on OBJ${objectId}`
          );
        }
        continue;
      }

      const attributeId =
        ATTRIBUTE_IDS[attributeName as keyof typeof ATTRIBUTE_IDS];
      if (!attributeId) {
        continue;
      }

      statements.push(
        upsertSql(
          "objects_attributes",
          {
            objectId,
            attributeId,
            value: rawValue,
          },
          ["objectId", "attributeId"]
        )
      );
    }

    const classIds = [];
    for (let index = 1; index <= 12; index += 1) {
      const className = fields[`CP${index}`];
      const classId = resolveClassId(className);
      if (classId) {
        classIds.push(classId);
      }
    }

    statements.push(
      `DELETE FROM \`objects_classes\` WHERE \`objectId\`=${objectId};`
    );
    for (const classId of classIds) {
      statements.push(
        `INSERT INTO \`objects_classes\` (\`objectId\`, \`classId\`) VALUES (${objectId}, ${classId});`
      );
    }

    count += 1;
  }

  return { statements, count, skipped: false };
};
