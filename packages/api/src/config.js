import path from 'path'
import dotenv from 'dotenv'

const envPath = process.env.ENV_PATH || process.cwd()
dotenv.config({ path: path.resolve(envPath, '.env') })

const app = {
  rootDir: `${__dirname}/src`,
  port: process.env.PORT || 3000
}

const db = {
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
};

export default {
  app, db
}
