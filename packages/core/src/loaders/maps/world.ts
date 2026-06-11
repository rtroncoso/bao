import {
  BORDER_TRIGGER_TYPE,
  MAP_BORDER_X,
  MAP_BORDER_Y,
  TILE_SIZE,
  TILED_MAP_SIZE,
} from '@bao/core/constants/game/Map';
import { createProperty } from '@bao/core/loaders/maps/tmx/util';
import { GroupLayer, ObjectLayer, TmxObject } from '@bao/core/models';
import { MapTileExit } from './meta';

export type BorderDirection = 'north' | 'south' | 'east' | 'west';

export interface BorderNeighbor {
  direction: BorderDirection;
  targetMapId: number;
  entryX: number;
  entryY: number;
}

export interface WorldMapEntry {
  fileName: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface WorldsJson {
  maps: WorldMapEntry[];
  onlyShowAdjacentMaps: boolean;
  type: 'world';
}

const EDGE_MARGIN_X = MAP_BORDER_X;
const EDGE_MARGIN_Y = MAP_BORDER_Y;
const [MAP_WIDTH, MAP_HEIGHT] = TILED_MAP_SIZE;
const MAP_PIXEL_WIDTH = MAP_WIDTH * TILE_SIZE;
const MAP_PIXEL_HEIGHT = MAP_HEIGHT * TILE_SIZE;

const getBorderDirection = (x: number, y: number): BorderDirection | null => {
  if (y <= EDGE_MARGIN_Y) {
    return 'north';
  }
  if (y >= MAP_HEIGHT - EDGE_MARGIN_Y - 1) {
    return 'south';
  }
  if (x <= EDGE_MARGIN_X) {
    return 'west';
  }
  if (x >= MAP_WIDTH - EDGE_MARGIN_X - 1) {
    return 'east';
  }
  return null;
};

/**
 * Infer travel direction from a tile exit and its destination coords.
 * Pairing source/target edges is more reliable than source position alone.
 */
export const inferExitDirection = (
  x: number,
  y: number,
  targetX: number,
  targetY: number,
): BorderDirection | null => {
  const onNorth = y <= EDGE_MARGIN_Y;
  const onSouth = y >= MAP_HEIGHT - EDGE_MARGIN_Y - 1;
  const onWest = x <= EDGE_MARGIN_X;
  const onEast = x >= MAP_WIDTH - EDGE_MARGIN_X - 1;

  const tgtNorth = targetY <= EDGE_MARGIN_Y;
  const tgtSouth = targetY >= MAP_HEIGHT - EDGE_MARGIN_Y - 1;
  const tgtWest = targetX <= EDGE_MARGIN_X;
  const tgtEast = targetX >= MAP_WIDTH - EDGE_MARGIN_X - 1;

  if (onNorth && tgtSouth) {
    return 'north';
  }
  if (onSouth && tgtNorth) {
    return 'south';
  }
  if (onWest && tgtEast) {
    return 'west';
  }
  if (onEast && tgtWest) {
    return 'east';
  }

  if (onNorth && !onWest && !onEast) {
    return 'north';
  }
  if (onSouth && !onWest && !onEast) {
    return 'south';
  }
  if (onWest && !onNorth && !onSouth) {
    return 'west';
  }
  if (onEast && !onNorth && !onSouth) {
    return 'east';
  }

  return getBorderDirection(x, y);
};

/**
 * Groups tile exits by border direction and picks the dominant target per edge.
 */
export const computeBorderNeighbors = (tileExits: MapTileExit[]): BorderNeighbor[] => {
  const buckets: Record<BorderDirection, Map<number, { count: number; entryX: number; entryY: number }>> = {
    north: new Map(),
    south: new Map(),
    east: new Map(),
    west: new Map(),
  };

  for (const exit of tileExits) {
    const direction = inferExitDirection(exit.x, exit.y, exit.targetX, exit.targetY);
    if (!direction) {
      continue;
    }

    const bucket = buckets[direction];
    const current = bucket.get(exit.targetMapId) ?? {
      count: 0,
      entryX: exit.targetX,
      entryY: exit.targetY,
    };
    current.count += 1;
    bucket.set(exit.targetMapId, current);
  }

  const neighbors: BorderNeighbor[] = [];
  (Object.keys(buckets) as BorderDirection[]).forEach((direction) => {
    let bestTarget = 0;
    let bestCount = 0;
    let entryX = 0;
    let entryY = 0;

    buckets[direction].forEach((value, targetMapId) => {
      if (value.count > bestCount) {
        bestCount = value.count;
        bestTarget = targetMapId;
        entryX = value.entryX;
        entryY = value.entryY;
      }
    });

    if (bestTarget > 0) {
      neighbors.push({ direction, targetMapId: bestTarget, entryX, entryY });
    }
  });

  return neighbors;
};

let borderObjectId = 0;

const makeBorderShape = ({
  direction,
  targetMapId,
  entryX,
  entryY,
}: BorderNeighbor): TmxObject => {
  const object = new TmxObject();
  object.type = BORDER_TRIGGER_TYPE;
  object.id = ++borderObjectId;

  const thickness = TILE_SIZE * 2;
  switch (direction) {
    case 'north':
      object.x = 0;
      object.y = 0;
      object.width = MAP_PIXEL_WIDTH;
      object.height = thickness;
      break;
    case 'south':
      object.x = 0;
      object.y = MAP_PIXEL_HEIGHT - thickness;
      object.width = MAP_PIXEL_WIDTH;
      object.height = thickness;
      break;
    case 'west':
      object.x = 0;
      object.y = 0;
      object.width = thickness;
      object.height = MAP_PIXEL_HEIGHT;
      break;
    case 'east':
      object.x = MAP_PIXEL_WIDTH - thickness;
      object.y = 0;
      object.width = thickness;
      object.height = MAP_PIXEL_HEIGHT;
      break;
    default:
      break;
  }

  createProperty(object, 'direction', direction);
  createProperty(object, 'targetMapId', targetMapId);
  createProperty(object, 'entryX', entryX);
  createProperty(object, 'entryY', entryY);

  return object;
};

export interface MakeBorderTriggersLayerParameters {
  neighbors: BorderNeighbor[];
}

/**
 * Builds a client-only border trigger layer for map prefetching.
 */
export const makeBorderTriggersLayer = ({
  neighbors,
}: MakeBorderTriggersLayerParameters): GroupLayer => {
  const layer = new GroupLayer();
  const objects = new ObjectLayer();
  layer.name = 'Border Layer';
  objects.name = 'Border Triggers';
  objects.objects = neighbors.map(makeBorderShape);
  layer.layers.push(objects);
  return layer;
};

export interface BuildWorldsJsonParameters {
  mapIds: number[];
  tileExitsByMap: Record<number, MapTileExit[]>;
  overrides?: Record<number, { x?: number; y?: number }>;
}

type GridPlacementSource = 'edge' | 'fallback';

/**
 * Auto-layouts maps into a Tiled world JSON from connectivity graph.
 * Uses fixpoint edge propagation so maps are placed relative to exit links,
 * not only the first BFS path from the root map.
 */
export const buildWorldsJson = ({
  mapIds,
  tileExitsByMap,
  overrides = {},
}: BuildWorldsJsonParameters): WorldsJson => {
  const sortedIds = [...mapIds].sort((a, b) => a - b);
  const rootMapId = sortedIds[0] ?? 1;

  const directionDelta: Record<BorderDirection, { dx: number; dy: number }> = {
    north: { dx: 0, dy: -1 },
    south: { dx: 0, dy: 1 },
    east: { dx: 1, dy: 0 },
    west: { dx: -1, dy: 0 },
  };

  const gridKey = (gridX: number, gridY: number) => `${gridX},${gridY}`;
  const gridPos = new Map<number, { gridX: number; gridY: number }>();
  const placementSource = new Map<number, GridPlacementSource>();
  const gridOccupancy = new Map<string, number>();

  const releaseMap = (mapId: number) => {
    const pos = gridPos.get(mapId);
    if (!pos) {
      return;
    }

    gridOccupancy.delete(gridKey(pos.gridX, pos.gridY));
    gridPos.delete(mapId);
    placementSource.delete(mapId);
  };

  const tryPlaceMap = (
    mapId: number,
    gridX: number,
    gridY: number,
    source: GridPlacementSource
  ): boolean => {
    if (!sortedIds.includes(mapId)) {
      return false;
    }

    const key = gridKey(gridX, gridY);
    const occupant = gridOccupancy.get(key);
    if (occupant !== undefined && occupant !== mapId) {
      return false;
    }

    const existing = gridPos.get(mapId);
    if (existing) {
      if (existing.gridX === gridX && existing.gridY === gridY) {
        return false;
      }

      if (source === 'edge' && placementSource.get(mapId) === 'fallback') {
        releaseMap(mapId);
      } else {
        return false;
      }
    }

    gridPos.set(mapId, { gridX, gridY });
    placementSource.set(mapId, source);
    gridOccupancy.set(key, mapId);
    return true;
  };

  const edges: Array<{ from: number; to: number; direction: BorderDirection }> = [];
  for (const mapId of sortedIds) {
    for (const neighbor of computeBorderNeighbors(tileExitsByMap[mapId] ?? [])) {
      if (sortedIds.includes(neighbor.targetMapId)) {
        edges.push({
          from: mapId,
          to: neighbor.targetMapId,
          direction: neighbor.direction,
        });
      }
    }
  }

  tryPlaceMap(rootMapId, 0, 0, 'edge');

  let changed = true;
  let iterations = 0;
  const maxIterations = Math.max(sortedIds.length * 4, 8);

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations += 1;

    for (const { from, to, direction } of edges) {
      const fromPos = gridPos.get(from);
      if (!fromPos) {
        continue;
      }

      const delta = directionDelta[direction];
      if (tryPlaceMap(to, fromPos.gridX + delta.dx, fromPos.gridY + delta.dy, 'edge')) {
        changed = true;
      }
    }
  }

  let fallbackColumn = 0;
  for (const mapId of sortedIds) {
    if (gridPos.has(mapId)) {
      continue;
    }

    while (gridOccupancy.has(gridKey(fallbackColumn, 0))) {
      fallbackColumn += 1;
    }

    tryPlaceMap(mapId, fallbackColumn, 0, 'fallback');
    fallbackColumn += 1;
  }

  const positions: Record<number, { x: number; y: number }> = {};
  for (const [mapId, pos] of gridPos.entries()) {
    positions[mapId] = {
      x: pos.gridX * MAP_PIXEL_WIDTH,
      y: pos.gridY * MAP_PIXEL_HEIGHT,
    };
  }

  const maps: WorldMapEntry[] = sortedIds.map((mapId) => {
    const override = overrides[mapId] ?? {};
    const position = positions[mapId];
    return {
      fileName: `../maps/${mapId}.json`,
      width: MAP_PIXEL_WIDTH,
      height: MAP_PIXEL_HEIGHT,
      x: override.x ?? position.x,
      y: override.y ?? position.y,
    };
  });

  return {
    maps,
    onlyShowAdjacentMaps: false,
    type: 'world',
  };
};

export type WorldQuadrant = 1 | 2 | 3 | 4;

export interface WorldTileCoords {
  worldX: number;
  worldY: number;
}

export interface LocalTileCoords {
  mapId: number;
  localX: number;
  localY: number;
}

export interface GridNeighbors {
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  northWest?: number;
  northEast?: number;
  southWest?: number;
  southEast?: number;
}

const [PLAYABLE_WIDTH, PLAYABLE_HEIGHT] = TILED_MAP_SIZE;

export const parseMapIdFromEntry = (entry: WorldMapEntry): number => {
  const match = entry.fileName.match(/(\d+)\.json$/);
  return match ? Number.parseInt(match[1], 10) : 0;
};

export const getMapGridPosition = (
  mapId: number,
  worlds: WorldsJson
): { gridX: number; gridY: number } | null => {
  const entry = worlds.maps.find((map) => parseMapIdFromEntry(map) === mapId);
  if (!entry) {
    return null;
  }

  return {
    gridX: Math.round(entry.x / MAP_PIXEL_WIDTH),
    gridY: Math.round(entry.y / MAP_PIXEL_HEIGHT),
  };
};

export const getMapIdAtGrid = (
  gridX: number,
  gridY: number,
  worlds: WorldsJson
): number | null => {
  const entry = worlds.maps.find(
    (map) =>
      Math.round(map.x / MAP_PIXEL_WIDTH) === gridX &&
      Math.round(map.y / MAP_PIXEL_HEIGHT) === gridY
  );

  return entry ? parseMapIdFromEntry(entry) : null;
};

export const computeGridNeighbors = (
  mapId: number,
  worlds: WorldsJson
): GridNeighbors => {
  const position = getMapGridPosition(mapId, worlds);
  if (!position) {
    return {};
  }

  const { gridX, gridY } = position;
  const pick = (x: number, y: number) => getMapIdAtGrid(x, y, worlds) ?? undefined;

  return {
    north: pick(gridX, gridY - 1),
    south: pick(gridX, gridY + 1),
    east: pick(gridX + 1, gridY),
    west: pick(gridX - 1, gridY),
    northWest: pick(gridX - 1, gridY - 1),
    northEast: pick(gridX + 1, gridY - 1),
    southWest: pick(gridX - 1, gridY + 1),
    southEast: pick(gridX + 1, gridY + 1),
  };
};

export const toWorldTile = (
  mapId: number,
  localX: number,
  localY: number,
  worlds: WorldsJson
): WorldTileCoords => {
  const position = getMapGridPosition(mapId, worlds);
  const gridX = position?.gridX ?? mapId;
  const gridY = position?.gridY ?? 0;

  return {
    worldX: gridX * PLAYABLE_WIDTH + localX,
    worldY: gridY * PLAYABLE_HEIGHT + localY,
  };
};

export const fromWorldTile = (
  worldX: number,
  worldY: number,
  worlds: WorldsJson
): LocalTileCoords | null => {
  const gridX = Math.floor(worldX / PLAYABLE_WIDTH);
  const gridY = Math.floor(worldY / PLAYABLE_HEIGHT);
  const mapId = getMapIdAtGrid(gridX, gridY, worlds);

  if (!mapId) {
    return null;
  }

  return {
    mapId,
    localX: worldX - gridX * PLAYABLE_WIDTH,
    localY: worldY - gridY * PLAYABLE_HEIGHT,
  };
};

export const getQuadrant = (localX: number, localY: number): WorldQuadrant => {
  const midX = Math.floor(PLAYABLE_WIDTH / 2);
  const midY = Math.floor(PLAYABLE_HEIGHT / 2);
  const west = localX < midX;
  const north = localY < midY;

  if (west && north) {
    return 1;
  }
  if (!west && north) {
    return 2;
  }
  if (west && !north) {
    return 3;
  }
  return 4;
};

export const getPrefetchMapIds = (
  mapId: number,
  quadrant: WorldQuadrant,
  worlds: WorldsJson
): number[] => {
  const neighbors = computeGridNeighbors(mapId, worlds);
  const ids = new Set<number>([mapId]);

  switch (quadrant) {
    case 1:
      if (neighbors.north) ids.add(neighbors.north);
      if (neighbors.west) ids.add(neighbors.west);
      if (neighbors.northWest) ids.add(neighbors.northWest);
      break;
    case 2:
      if (neighbors.north) ids.add(neighbors.north);
      if (neighbors.east) ids.add(neighbors.east);
      if (neighbors.northEast) ids.add(neighbors.northEast);
      break;
    case 3:
      if (neighbors.south) ids.add(neighbors.south);
      if (neighbors.west) ids.add(neighbors.west);
      if (neighbors.southWest) ids.add(neighbors.southWest);
      break;
    case 4:
      if (neighbors.south) ids.add(neighbors.south);
      if (neighbors.east) ids.add(neighbors.east);
      if (neighbors.southEast) ids.add(neighbors.southEast);
      break;
    default:
      break;
  }

  return [...ids].slice(0, 4);
};
