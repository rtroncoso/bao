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
  const [currentMapId, setCurrentMapId] = useState(DEFAULT_MAP_ID);
  const [currentMap, setCurrentMap] = useState<Tiled | null>(null);
  const [activeMapIds, setActiveMapIds] = useState<number[]>([DEFAULT_MAP_ID]);
  const [cacheRevision, setCacheRevision] = useState(0);
  const [worlds, setWorlds] = useState<WorldsJson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<number, Tiled>>(new Map());

  const localCharacter = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );

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
      return `${getAssetsBaseUrl()}/${mapPath}`;
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

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load map ${mapId}`);
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
        const ids = [mapId];
        setActiveMapIds(ids);
        return ids;
      }

      const activeQuadrant = quadrant ?? getQuadrant(localX, localY);
      const activeIds = getPrefetchMapIds(mapId, activeQuadrant, worlds);
      await Promise.all(activeIds.map((id) => prefetchMap(id)));
      trimCache(cacheRef.current, activeIds);

      setActiveMapIds(activeIds);
      setCacheRevision((revision) => revision + 1);
      return activeIds;
    },
    [prefetchMap, worlds]
  );

  const activeMaps = useMemo(() => {
    const characterMapId = localCharacter?.mapId ?? currentMapId;
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
  }, [
    activeMapIds,
    cacheRevision,
    currentMapId,
    localCharacter?.mapId,
    worlds
  ]);

  useEffect(() => {
    const mapId = localCharacter?.mapId;
    if (!mapId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      await prefetchMap(mapId);

      let ids = [mapId];
      if (worlds && localCharacter) {
        const quadrant = getQuadrant(
          localCharacter.tile.x,
          localCharacter.tile.y
        );
        ids = getPrefetchMapIds(mapId, quadrant, worlds);
        await Promise.all(ids.map((id) => prefetchMap(id)));
        trimCache(cacheRef.current, ids);
      }

      if (cancelled) {
        return;
      }

      setActiveMapIds(ids);
      setCacheRevision((revision) => revision + 1);
      setCurrentMapId((previous) => (previous === mapId ? previous : mapId));
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [localCharacter?.mapId, worlds, prefetchMap]);

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
