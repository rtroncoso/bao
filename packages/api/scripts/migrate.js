const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const {
  envNumber,
  envString,
  loadRootEnv,
  requireEnv,
} = require('@bao/env');

const SQL_DIR = path.resolve(__dirname, '../sql');

/** Apply in dependency order (not lexicographic filename order). */
const MIGRATIONS = [
  '2020-11-09_full.sql',
  '2026-06-09_world_integration.sql',
  '2020-11-09_characters.sql',
];

const parseArgs = () => {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const options = {
    dryRun: false,
    only: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--only') {
      options.only = args[index + 1] ?? null;
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: pnpm migrate [--dry-run] [--only <filename.sql>]

Runs pending SQL migrations in order, one transaction per file.
Already-applied migrations are skipped (tracked in schema_migrations).

Migrations:
${MIGRATIONS.map((name) => `  - ${name}`).join('\n')}
`);
      process.exit(0);
    }
  }

  return options;
};

const checksumForFile = (filePath) =>
  crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

const prepareSql = (content) =>
  content
    .replace(/^\s*START TRANSACTION\s*;/gim, '')
    .replace(/^\s*COMMIT\s*;/gim, '')
    .trim();

const ensureMigrationsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`checksum\` char(64) NOT NULL,
      \`applied_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`schema_migrations_name_unique\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const loadAppliedMigrations = async (connection) => {
  const [rows] = await connection.query(
    'SELECT `name`, `checksum` FROM `schema_migrations`'
  );

  return new Map(rows.map((row) => [row.name, row]));
};

const runMigration = async (connection, fileName, dryRun) => {
  const filePath = path.join(SQL_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filePath}`);
  }

  const checksum = checksumForFile(filePath);
  const sql = prepareSql(fs.readFileSync(filePath, 'utf8'));

  if (!sql) {
    throw new Error(`Migration file is empty: ${fileName}`);
  }

  if (dryRun) {
    console.log(`[migrate] would apply ${fileName}`);
    return;
  }

  await connection.beginTransaction();

  try {
    await connection.query(sql);
    await connection.query(
      'INSERT INTO `schema_migrations` (`name`, `checksum`) VALUES (?, ?)',
      [fileName, checksum]
    );
    await connection.commit();
    console.log(`[migrate] applied ${fileName}`);
  } catch (error) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration ${fileName} failed: ${message}`);
  }
};

const main = async () => {
  loadRootEnv(__dirname);
  const options = parseArgs();

  const connection = await mysql.createConnection({
    host: envString('MYSQL_HOST', 'localhost'),
    port: envNumber('MYSQL_PORT', 3306),
    user: envString('MYSQL_USER', 'root'),
    password: envString('MYSQL_PASSWORD', ''),
    database: requireEnv('MYSQL_DATABASE'),
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(connection);
    const applied = await loadAppliedMigrations(connection);

    const selected = options.only
      ? MIGRATIONS.filter((name) => name === options.only)
      : [...MIGRATIONS];

    if (options.only && selected.length === 0) {
      throw new Error(`Unknown migration: ${options.only}`);
    }

    for (const fileName of selected) {
      const filePath = path.join(SQL_DIR, fileName);
      const checksum = checksumForFile(filePath);
      const existing = applied.get(fileName);

      if (existing) {
        if (existing.checksum !== checksum) {
          throw new Error(
            `Migration ${fileName} was already applied with a different checksum. ` +
              'If the SQL file changed, add a new migration file instead of editing an applied one.'
          );
        }

        console.log(`[migrate] skip ${fileName} (already applied)`);
        continue;
      }

      await runMigration(connection, fileName, options.dryRun);
    }

    if (options.dryRun) {
      console.log('[migrate] dry-run complete');
    } else {
      console.log('[migrate] complete');
    }
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
