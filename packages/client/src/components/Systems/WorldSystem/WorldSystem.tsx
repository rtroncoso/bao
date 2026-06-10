import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useSelector } from 'react-redux';

import {
  getPrefetchMapIds,
  getQuadrant,
  Tiled,
  WorldsJson,
  WorldQuadrant
} from '@bao/core';
import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { selectManifest } from '@bao/client/queries';
import { State } from '@bao/client/store';

const MAX_CACHED_MAPS = 4;

export interface WorldContextState {
  currentMapId: number;
  currentMap: Tiled | null;
  isLoading: boolean;
  worlds: WorldsJson | null;
  loadMap: (mapId: number) => Promise<Tiled | null>;
  prefetchMap: (mapId: number) => Promise<void>;
  prefetchForCharacter: (
    mapId: number,
    localX: number,
    localY: number,
    quadrant?: WorldQuadrant
  ) => Promise<void>;
  setCurrentMapId: (mapId: number) => void;
}

const WorldContext = createContext<WorldContextState>({
  currentMapId: 34,
  currentMap: null,
  isLoading: false,
  worlds: null,
  loadMap: async () => null,
  prefetchMap: async () => undefined,
  prefetchForCharacter: async () => undefined,
  setCurrentMapId: () => undefined
});

export const useWorldContext = () => useContext(WorldContext);

const getAssetsBaseUrl = () =>
  process.env.NEXT_PUBLIC_BAO_ASSETS?.replace(/\/$/, '') ?? '';

const trimCache = (cache: Map<number, Tiled>, keepIds: number[]) => {
  const keep = new Set(keepIds);

  for (const mapId of cache.keys()) {
    if (!keep.has(mapId)) {
      cache.delete(mapId);
    }
  }

  while (cache.size > MAX_CACHED_MAPS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    cache.delete(oldest);
  }
};

export const WorldSystem: React.FC = ({ children }) => {
  const manifest = useSelector((state: State) => selectManifest(state));
  const { state: gameState } = useGameContext();
  const [currentMapId, setCurrentMapId] = useState(34);
  const [currentMap, setCurrentMap] = useState<Tiled | null>(null);
  const [worlds, setWorlds] = useState<WorldsJson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<number, Tiled>>(new Map());

  const localCharacter = resolveLocalCharacter(
    gameState.serverState,
    gameState.characterId,
    gameState.room?.sessionId
  );

  const resolveMapUrl = useCallback(
    (mapId: number) => {
      const mapPath = manifest?.maps?.[String(mapId)];
      if (!mapPath) {
        return null;
      }
      return `${getAssetsBaseUrl()}/${mapPath}`;
    },
    [manifest]
  );

  const loadMap = useCallback(
    async (mapId: number) => {
      const cached = cacheRef.current.get(mapId);
      if (cached) {
        cacheRef.current.delete(mapId);
        cacheRef.current.set(mapId, cached);
        return cached;
      }

      const url = resolveMapUrl(mapId);
      if (!url) {
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load map ${mapId}`);
      }

      const map = (await response.json()) as Tiled;
      cacheRef.current.set(mapId, map);
      trimCache(cacheRef.current, [mapId]);
      return map;
    },
    [resolveMapUrl]
  );

  const prefetchMap = useCallback(
    async (mapId: number) => {
      if (cacheRef.current.has(mapId)) {
        return;
      }
      await loadMap(mapId);
    },
    [loadMap]
  );

  const prefetchForCharacter = useCallback(
    async (
      mapId: number,
      localX: number,
      localY: number,
      quadrant?: WorldQuadrant
    ) => {
      if (!worlds) {
        await prefetchMap(mapId);
        return;
      }

      const activeQuadrant = quadrant ?? getQuadrant(localX, localY);
      const activeIds = getPrefetchMapIds(mapId, activeQuadrant, worlds);
      trimCache(cacheRef.current, activeIds);
      await Promise.all(activeIds.map((id) => prefetchMap(id)));
    },
    [prefetchMap, worlds]
  );

  useEffect(() => {
    if (!manifest?.worlds) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch(
          `${getAssetsBaseUrl()}/${manifest.worlds}`
        );
        if (!response.ok) {
          throw new Error('Failed to load worlds.json');
        }
        const data = (await response.json()) as WorldsJson;
        if (!cancelled) {
          setWorlds(data);
        }
      } catch (error) {
        console.error('[WorldSystem] failed to load worlds.json', error);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [manifest?.worlds]);

  useEffect(() => {
    if (localCharacter?.mapId && localCharacter.mapId !== currentMapId) {
      setCurrentMapId(localCharacter.mapId);
    }
  }, [currentMapId, localCharacter?.mapId]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const map = await loadMap(currentMapId);
        if (!cancelled) {
          setCurrentMap(map);
        }
      } catch (error) {
        console.error('[WorldSystem] failed to load map', currentMapId, error);
        if (!cancelled) {
          setCurrentMap(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (manifest?.maps?.[String(currentMapId)]) {
      run();
    }

    return () => {
      cancelled = true;
    };
  }, [currentMapId, loadMap, manifest]);

  useEffect(() => {
    if (!localCharacter) {
      return;
    }

    void prefetchForCharacter(
      localCharacter.mapId ?? currentMapId,
      localCharacter.tile.x,
      localCharacter.tile.y
    );
  }, [
    currentMapId,
    localCharacter?.mapId,
    localCharacter?.tile.x,
    localCharacter?.tile.y,
    prefetchForCharacter
  ]);

  const value = useMemo(
    () => ({
      currentMapId,
      currentMap,
      isLoading,
      worlds,
      loadMap,
      prefetchMap,
      prefetchForCharacter,
      setCurrentMapId
    }),
    [
      currentMapId,
      currentMap,
      isLoading,
      worlds,
      loadMap,
      prefetchMap,
      prefetchForCharacter
    ]
  );

  return (
    <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
  );
};
