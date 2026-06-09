import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

let loaded = false

export function findMonorepoRoot(startDir: string): string {
  let dir = path.resolve(startDir)

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir
    }
    dir = path.dirname(dir)
  }

  throw new Error('Could not find monorepo root (pnpm-workspace.yaml)')
}

/** Load the root `.env` once per process. */
export function loadRootEnv(callerDir: string): string {
  const root = findMonorepoRoot(callerDir)

  if (!loaded) {
    dotenv.config({ path: path.join(root, '.env') })
    loaded = true
  }

  return root
}

export function envString(name: string, fallback?: string): string | undefined {
  const value = process.env[name]
  if (value === undefined || value === '') {
    return fallback
  }
  return value
}

export function envNumber(name: string, fallback: number): number {
  const value = process.env[name]
  if (value === undefined || value === '') {
    return fallback
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`)
  }

  return parsed
}

export function requireEnv(name: string): string {
  const value = envString(name)
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value
}
