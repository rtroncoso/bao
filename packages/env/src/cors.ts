/**
 * Parse comma-separated CORS allowlist entries.
 * Supports exact origins (https://app.example.com) and host wildcards (*.vercel.app).
 */
export function parseCorsOrigins(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : undefined;
}

export function hostnameFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

/**
 * True when `pattern` is an exact origin match or a `*.domain` host wildcard.
 */
export function matchesCorsPattern(
  requestOrigin: string,
  pattern: string
): boolean {
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1);
    const host = hostnameFromOrigin(requestOrigin);
    if (!host) {
      return false;
    }

    return host === suffix.slice(1) || host.endsWith(suffix);
  }

  return pattern === requestOrigin;
}

export function isOriginAllowed(
  requestOrigin: string | undefined,
  allowedOrigins?: string[]
): boolean {
  if (!allowedOrigins) {
    return true;
  }

  // Non-browser clients (load tests, server-to-server) omit Origin.
  if (!requestOrigin) {
    return true;
  }

  return allowedOrigins.some((pattern) =>
    matchesCorsPattern(requestOrigin, pattern)
  );
}

export function buildExpressCorsOptions(allowedOrigins?: string[]) {
  if (!allowedOrigins) {
    return {};
  }

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void
    ) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, origin ?? true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };
}

export function buildMatchmakeCorsHeaders(
  requestOrigin: string | undefined,
  allowedOrigins?: string[]
): Record<string, string | number> {
  const allowOrigin =
    !allowedOrigins || !requestOrigin
      ? '*'
      : isOriginAllowed(requestOrigin, allowedOrigins)
        ? requestOrigin
        : 'null';

  return {
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Max-Age': 2592000,
    Vary: 'Origin'
  };
}
