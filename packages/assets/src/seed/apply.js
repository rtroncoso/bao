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

const LOCK_WAIT_TIMEOUT_SEC = envNumber('MYSQL_LOCK_WAIT_TIMEOUT', 300);
const BATCH_COMMIT_SIZE = envNumber('SEED_BATCH_COMMIT_SIZE', 200);

const splitSqlStatements = (sql) =>
  sql
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(
      (statement) =>
        statement.length > 0 && !statement.startsWith('--'),
    );

const executeInBatches = async (connection, statements, debug, fileName) => {
  let pending = 0;

  for (let index = 0; index < statements.length; index++) {
    const statement = statements[index];
    if (!statement) {
      continue;
    }

    if (pending === 0) {
      await connection.beginTransaction();
    }

    await connection.query(`${statement};`);
    pending += 1;

    const isLast = index === statements.length - 1;
    if (pending >= BATCH_COMMIT_SIZE || isLast) {
      await connection.commit();
      if (debug) {
        console.log(
          `[seed:apply] ${fileName}: committed ${index + 1}/${statements.length} statements`,
        );
      }
      pending = 0;
    }
  }
};

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
    await connection.query(
      `SET SESSION innodb_lock_wait_timeout = ${LOCK_WAIT_TIMEOUT_SEC}`,
    );

    for (const fileName of sqlFiles) {
      const filePath = path.join(outputDir, fileName);
      const sql = fs.readFileSync(filePath, 'utf8');

      if (debug) {
        console.log(`[seed:apply] Executing ${fileName}`);
      }

      const statements = splitSqlStatements(sql);
      const useBatches =
        fileName === '04_maps.sql' || statements.length > BATCH_COMMIT_SIZE;

      try {
        if (useBatches) {
          await executeInBatches(connection, statements, debug, fileName);
        } else {
          await connection.beginTransaction();
          await connection.query(sql);
          await connection.commit();
        }
      } catch (error) {
        try {
          await connection.rollback();
        } catch {
          // ignore rollback errors after failed batch
        }
        throw new Error(`Failed applying ${fileName}: ${error.message}`);
      }
    }
  } finally {
    await connection.end();
  }

  return sqlFiles.length;
};
