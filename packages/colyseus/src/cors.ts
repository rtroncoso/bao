import type { IncomingMessage, ServerResponse } from 'http';
import type { Server } from 'colyseus';
import { buildMatchmakeCorsHeaders, isOriginAllowed } from '@bao/env';

export {
  buildExpressCorsOptions,
  isOriginAllowed,
  parseCorsOrigins
} from '@bao/env';

export function getRequestOrigin(req: IncomingMessage): string | undefined {
  const origin = req.headers.origin;
  return Array.isArray(origin) ? origin[0] : origin;
}

type MatchmakeServer = Server & {
  handleMatchMakeRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void>;
};

export function patchMatchmakeCors(
  gameServer: Server,
  allowedOrigins?: string[]
): void {
  const server = gameServer as MatchmakeServer;
  const original = server.handleMatchMakeRequest.bind(server);

  server.handleMatchMakeRequest = async (req, res) => {
    const requestOrigin = getRequestOrigin(req);
    const corsHeaders = buildMatchmakeCorsHeaders(
      requestOrigin,
      allowedOrigins
    );

    if (!isOriginAllowed(requestOrigin, allowedOrigins)) {
      console.warn(
        `[cors] blocked ${req.method} ${req.url} from origin "${
          requestOrigin ?? '(none)'
        }"`
      );
      res.writeHead(403, corsHeaders);
      res.end();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = ((statusCode, ...args) => {
      const headers = args.find(
        (arg): arg is Record<string, string | number> =>
          typeof arg === 'object' && arg !== null && !Array.isArray(arg)
      );

      if (headers) {
        Object.assign(headers, corsHeaders);
      }

      return originalWriteHead(
        statusCode,
        ...(args as Parameters<typeof res.writeHead>)
      );
    }) as typeof res.writeHead;

    return original(req, res);
  };
}
