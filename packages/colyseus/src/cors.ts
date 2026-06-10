import type { CorsOptions } from 'cors'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Server } from 'colyseus'

export function parseCorsOrigins(value?: string): string[] | undefined {
  if (!value) {
    return undefined
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return origins.length > 0 ? origins : undefined
}

export function getRequestOrigin(req: IncomingMessage): string | undefined {
  const origin = req.headers.origin
  return Array.isArray(origin) ? origin[0] : origin
}

export function isOriginAllowed(
  requestOrigin: string | undefined,
  allowedOrigins?: string[]
): boolean {
  if (!allowedOrigins) {
    return true
  }

  // Non-browser clients (load tests, server-to-server) omit Origin.
  if (!requestOrigin) {
    return true
  }

  return allowedOrigins.includes(requestOrigin)
}

export function buildExpressCorsOptions(allowedOrigins?: string[]): CorsOptions {
  if (!allowedOrigins) {
    return {}
  }

  return {
    origin: allowedOrigins,
    credentials: true,
  }
}

export function buildMatchmakeCorsHeaders(
  req: IncomingMessage,
  allowedOrigins?: string[]
): Record<string, string | number> {
  const requestOrigin = getRequestOrigin(req)
  const allowOrigin =
    !allowedOrigins || !requestOrigin
      ? '*'
      : allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : 'null'

  return {
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Max-Age': 2592000,
    Vary: 'Origin',
  }
}

type MatchmakeServer = Server & {
  handleMatchMakeRequest(req: IncomingMessage, res: ServerResponse): Promise<void>
}

export function patchMatchmakeCors(
  gameServer: Server,
  allowedOrigins?: string[]
): void {
  const server = gameServer as MatchmakeServer
  const original = server.handleMatchMakeRequest.bind(server)

  server.handleMatchMakeRequest = async (req, res) => {
    const corsHeaders = buildMatchmakeCorsHeaders(req, allowedOrigins)

    if (!isOriginAllowed(getRequestOrigin(req), allowedOrigins)) {
      res.writeHead(403, corsHeaders)
      res.end()
      return
    }

    const originalWriteHead = res.writeHead.bind(res)
    res.writeHead = ((statusCode, ...args) => {
      const headers = args.find(
        (arg): arg is Record<string, string | number> =>
          typeof arg === 'object' && arg !== null && !Array.isArray(arg)
      )

      if (headers) {
        Object.assign(headers, corsHeaders)
      }

      return originalWriteHead(statusCode, ...(args as Parameters<typeof res.writeHead>))
    }) as typeof res.writeHead

    return original(req, res)
  }
}
