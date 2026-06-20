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
import {
  localCharacterRef,
  subscribeGamePatch
} from '@bao/client/lib/game-server-state';
import { assetUrl, fetchAssetJson } from '@bao/client/lib/baoUrls';
import { selectManifest } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { getMapWorldOffset } from './worldUtils';

const MAX_CACHED_MAPS = 4;
const DEFAULT_MAP_ID = 1;

export interface ActiveWorldMap {
  mapId: number;
  map: Tiled;
  offsetX: number;
  offsetY: number;
}

export interface WorldContextState {
  currentMapId: number;
  currentMap: Tiled | null;
  activeMapIds: number[];
  activeMaps: ActiveWorldMap[];
  isLoading: boolean;
  worlds: WorldsJson | null;
  loadMap: (mapId: number) => Promise<Tiled | null>;
  prefetchMap: (mapId: number) => Promise<void>;
  prefetchForCharacter: (
    mapId: number,
    localX: number,
    localY: number,
    quadrant?: WorldQuadrant
  ) => Promise<number[]>;
  getMapOffset: (mapId: number) => { x: number; y: number };
  setCurrentMapId: (mapId: number) => void;
}

const WorldContext = createContext<WorldContextState>({
  currentMapId: DEFAULT_MAP_ID,
  currentMap: null,
  activeMapIds: [DEFAULT_MAP_ID],
  activeMaps: [],
  isLoading: false,
  worlds: null,
  loadMap: async () => null,
  prefetchMap: async () => undefined,
  prefetchForCharacter: async () => [DEFAULT_MAP_ID],
  getMapOffset: () => ({ x: 0, y: 0 }),
  setCurrentMapId: () => undefined
});

export const useWorldContext = () => useContext(WorldContext);

const DEFAULT_WORLDS_PATH = 'worlds/worlds.json';

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

const prefetchMapsSafe = async (
  mapIds: number[],
  loadMap: (mapId: number) => Promise<Tiled | null>
) => {
  const loaded: number[] = [];

  await Promise.all(
    mapIds.map(async (mapId) => {
      try {
        const map = await loadMap(mapId);
        if (map) {
          loaded.push(mapId);
        }
      } catch (error) {
        console.error(`[WorldSystem] failed to prefetch map ${mapId}`, error);
      }
    })
  );

  return loaded;
};

export const WorldSystem: React.FC = ({ children }) => {
  const manifest = useSelector((state: State) => selectManifest(state));
  const { state: gameState } = useGameContext();
  const [currentMapId, setCurrentMapId] = useState(DEFAULT_MAP_ID);
  const [currentMap, setCurrentMap] = useState<Tiled | null>(null);
  const [activeMapIds, setActiveMapIds] = useState<number[]>([DEFAULT_MAP_ID]);
  const [cacheRevision, setCacheRevision] = useState(0);
  const [worlds, setWorlds] = useState<WorldsJson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<number, Tiled>>(new Map());

  const mapManifestPath = manifest?.maps?.[String(currentMapId)] ?? null;

  const getMapOffset = useCallback(
    (mapId: number) => getMapWorldOffset(mapId, worlds),
    [worlds]
  );

  const resolveMapUrl = useCallback(
    (mapId: number) => {
      const mapPath = manifest?.maps?.[String(mapId)];
      if (!mapPath) {
        return null;
      }
      return assetUrl(mapPath);
    },
    [manifest?.maps]
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

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.error(
          `[WorldSystem] failed to load map ${mapId} (${response.status}) from ${url}`
        );
        return null;
      }

      const map = (await response.json()) as Tiled;
      cacheRef.current.set(mapId, map);
      setCacheRevision((revision) => revision + 1);
      return map;
    },
    [resolveMapUrl]
  );

  const prefetchMap = useCallback(
    async (mapId: number) => {
      if (cacheRef.current.has(mapId)) {
        return;
      }

      try {
        await loadMap(mapId);
      } catch (error) {
        console.error(`[WorldSystem] failed to prefetch map ${mapId}`, error);
      }
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
        const ids = [mapId];
        setActiveMapIds(ids);
        return ids;
      }

      const activeQuadrant = quadrant ?? getQuadrant(localX, localY);
      const requestedIds = getPrefetchMapIds(mapId, activeQuadrant, worlds);
      const loadedIds = await prefetchMapsSafe(requestedIds, loadMap);
      const ids =
        loadedIds.length > 0
          ? [...new Set([mapId, ...loadedIds])]
          : cacheRef.current.has(mapId)
          ? [mapId]
          : loadedIds;
      trimCache(cacheRef.current, ids);

      setActiveMapIds(ids);
      setCacheRevision((revision) => revision + 1);
      return ids;
    },
    [prefetchMap, worlds, loadMap]
  );

  const activeMaps = useMemo(() => {
    const characterMapId = currentMapId;
    const ids = [
      ...new Set([
        ...(activeMapIds.length > 0 ? activeMapIds : []),
        characterMapId || DEFAULT_MAP_ID
      ])
    ];

    return ids.flatMap((mapId) => {
      const map = cacheRef.current.get(mapId);
      if (!map) {
        return [];
      }

      const offset = getMapWorldOffset(mapId, worlds);
      return [
        {
          mapId,
          map,
          offsetX: offset.x,
          offsetY: offset.y
        }
      ];
    });
  }, [activeMapIds, cacheRevision, currentMapId, worlds]);

  useEffect(() => {
    const room = gameState.room;
    if (!room || !worlds) {
      return;
    }

    let lastMapId: number | null = null;

    const syncMap = () => {
      const local = localCharacterRef.current;
      const mapId = local?.mapId;
      if (!mapId || !local) {
        return;
      }

      setCurrentMapId((previous) => (previous === mapId ? previous : mapId));

      if (mapId === lastMapId) {
        return;
      }

      lastMapId = mapId;
      const { x, y } = local.tile;
      void prefetchForCharacter(mapId, x, y, getQuadrant(x, y));
    };

    syncMap();
    return subscribeGamePatch(syncMap, ['map']);
  }, [gameState.room, gameState.characterId, worlds, prefetchForCharacter]);

  useEffect(() => {
    if (!manifest?.maps) {
      return;
    }

    let cancelled = false;
    const worldsPath = manifest.worlds ?? DEFAULT_WORLDS_PATH;

    const run = async () => {
      const data = await fetchAssetJson<WorldsJson>(worldsPath);
      if (!cancelled && data) {
        console.info(
          `[WorldSystem] loaded worlds.json (${
            data.maps.length
          } maps) from ${assetUrl(worldsPath)}`
        );
        setWorlds(data);
      } else if (!cancelled && !data) {
        console.error(
          `[WorldSystem] failed to load worlds.json from ${assetUrl(
            worldsPath
          )}`
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [manifest?.maps, manifest?.worlds]);

  useEffect(() => {
    if (!mapManifestPath) {
      setCurrentMap(null);
      setIsLoading(false);
      return;
    }

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

    run();

    return () => {
      cancelled = true;
    };
  }, [currentMapId, loadMap, mapManifestPath]);

  const value = useMemo(
    () => ({
      currentMapId,
      currentMap,
      activeMapIds,
      activeMaps,
      isLoading,
      worlds,
      loadMap,
      prefetchMap,
      prefetchForCharacter,
      getMapOffset,
      setCurrentMapId
    }),
    [
      currentMapId,
      currentMap,
      activeMapIds,
      activeMaps,
      isLoading,
      worlds,
      loadMap,
      prefetchMap,
      prefetchForCharacter,
      getMapOffset
    ]
  );

  return (
    <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
  );
};
