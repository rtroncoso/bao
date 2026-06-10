import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import {
  envNumber,
  envString,
  loadRootEnv,
  requireEnv,
} from '@bao/env';

export const applySeedFiles = async ({ outputDir, debug }) => {
  loadRootEnv(path.dirname(fileURLToPath(import.meta.url)));

  const connection = await mysql.createConnection({
    host: envString('MYSQL_HOST', 'localhost'),
    port: envNumber('MYSQL_PORT', 3306),
    user: envString('MYSQL_USER', 'root'),
    password: envString('MYSQL_PASSWORD', ''),
    database: requireEnv('MYSQL_DATABASE'),
    multipleStatements: true,
  });

  const sqlFiles = fs
    .readdirSync(outputDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  if (sqlFiles.length === 0) {
    throw new Error(`No SQL files found in ${outputDir}`);
  }

  try {
    for (const fileName of sqlFiles) {
      const filePath = path.join(outputDir, fileName);
      const sql = fs.readFileSync(filePath, 'utf8');

      if (debug) {
        console.log(`[seed:apply] Executing ${fileName}`);
      }

      await connection.beginTransaction();

      try {
        await connection.query(sql);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw new Error(`Failed applying ${fileName}: ${error.message}`);
      }
    }
  } finally {
    await connection.end();
  }

  return sqlFiles.length;
};
