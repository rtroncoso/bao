const trimTrailingSlash = (url: string) => url.replace(/\/$/, '');

export const getBaoAssetsBaseUrl = (): string =>
  trimTrailingSlash(process.env.NEXT_PUBLIC_BAO_ASSETS?.trim() ?? '');

export const assetUrl = (path: string): string => {
  const base = getBaoAssetsBaseUrl();
  const normalized = path.replace(/^\//, '');
  return base ? `${base}/${normalized}` : normalized;
};

export const fetchAssetJson = async <T>(path: string): Promise<T | null> => {
  const url = assetUrl(path);

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`[assets] ${response.status} ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[assets] failed to fetch ${url}`, error);
    return null;
  }
};

export const getBaoServerUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_BAO_SERVER?.trim();
  if (!configured) {
    throw new Error(
      'NEXT_PUBLIC_BAO_SERVER is not set. Configure it in Vercel env vars or root .env.'
    );
  }

  return trimTrailingSlash(configured);
};

export const isProgressEvent = (error: unknown): error is ProgressEvent =>
  typeof ProgressEvent !== 'undefined' && error instanceof ProgressEvent;

/**
 * Colyseus matchmake uses XHR; network/CORS failures surface as ProgressEvent.
 */
export const formatColyseusConnectError = (
  error: unknown,
  serverUrl: string
): string => {
  if (!isProgressEvent(error)) {
    const matchMake = error as { code?: number; message?: string };
    if (matchMake?.message) {
      return matchMake.message;
    }
    return String(error);
  }

  const hints: string[] = [];
  const pageOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const pageIsLocal =
    pageOrigin.includes('localhost') || pageOrigin.includes('127.0.0.1');
  const serverIsLocal =
    serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1');

  if (serverIsLocal && pageOrigin && !pageIsLocal) {
    hints.push(
      'NEXT_PUBLIC_BAO_SERVER still points at localhost — set your VPS wss:// URL in Vercel.'
    );
  }

  if (pageOrigin.startsWith('https:') && serverUrl.startsWith('ws://')) {
    hints.push('Use wss:// (not ws://) when the app is served over HTTPS.');
  }

  hints.push(
    'Confirm Colyseus is running and VPS CORS_ORIGINS includes this origin (e.g. *.vercel.app).'
  );

  return `Cannot reach game server at ${serverUrl}. ${hints.join(' ')}`;
};
