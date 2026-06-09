import { envNumber, envString, loadRootEnv, requireEnv } from '@bao/env'

loadRootEnv(__dirname)

const apiPort = envNumber('API_PORT', 9000)

export const config = {
  port: envNumber('SERVER_PORT', 7666),
  jwtSecret: requireEnv('JWT_SECRET'),
  apiBaseUrl: envString('API_BASE_URL') ?? `http://127.0.0.1:${apiPort}`,
}

export function validateConfig(): void {
  if (!config.jwtSecret) {
    throw new Error(
      'JWT_SECRET is required. Set it in the repo root .env (must match the API signing key).'
    )
  }
}
