import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let dir = path.resolve(__dirname, '../..')

while (dir !== path.dirname(dir)) {
  if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
    dotenv.config({ path: path.join(dir, '.env') })
    break
  }
  dir = path.dirname(dir)
}

const host = process.env.API_HOST || '127.0.0.1'
const port = Number(process.env.API_PORT || 9000)
const maxAttempts = Number(process.env.API_WAIT_ATTEMPTS || 60)
const intervalMs = Number(process.env.API_WAIT_INTERVAL_MS || 2000)
const healthPath = '/healthcheck'

function pingApi() {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { host, port, path: healthPath, timeout: 1500 },
      (res) => {
        res.resume()
        if (res.statusCode === 200) {
          resolve()
          return
        }
        reject(new Error(`unexpected status ${res.statusCode}`))
      }
    )

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
    req.on('error', reject)
  })
}

let loggedWait = false

// Give turbo a moment to spawn @bao/api:dev before the first healthcheck.
await new Promise((resolve) => setTimeout(resolve, 3000))

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    await pingApi()
    console.log(`API ready at http://${host}:${port}${healthPath}`)
    break
  } catch {
    if (!loggedWait) {
      console.log(
        `Waiting for API at http://${host}:${port}${healthPath} before starting Colyseus...`
      )
      loggedWait = true
    } else if (attempt % 10 === 0) {
      console.log(`Still waiting for API (attempt ${attempt}/${maxAttempts})...`)
    }

    if (attempt === maxAttempts) {
      console.error(
        `API did not become ready after ${(maxAttempts * intervalMs) / 1000}s.`
      )
      console.error(
        'Check @bao/api logs — start MySQL with: docker compose up -d mysql'
      )
      process.exit(1)
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}
