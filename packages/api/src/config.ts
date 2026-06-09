import type { PoolOptions } from 'mysql2'
import { envNumber, envString, loadRootEnv, requireEnv } from '@bao/env'

loadRootEnv(__dirname)

export const jwtSecret = requireEnv('JWT_SECRET')

const app = {
  rootDir: `${__dirname}`,
  port: envNumber('API_PORT', 9000),
}

const db: PoolOptions = {
  database: envString('MYSQL_DATABASE', 'bao'),
  host: envString('MYSQL_HOST', 'localhost'),
  password: envString('MYSQL_PASSWORD', ''),
  port: envNumber('MYSQL_PORT', 3306),
  user: envString('MYSQL_USER', 'root'),
  waitForConnections: true,
  connectionLimit: 10,
}

export default {
  app,
  db,
}
