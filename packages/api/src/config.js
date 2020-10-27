import path from 'path'
import dotenv from 'dotenv'

const envPath = process.env.ENV_PATH || process.cwd()
dotenv.config({ path: path.resolve(envPath, '.env') })

const app = {
  rootDir: `${__dirname}/src`,
  port: process.env.PORT || 3000
}

const db = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

export default {
  app, db
}
