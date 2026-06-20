import type { Rectangle as ViewportRectangle } from '@bao/client/components/Systems/ViewportSystem';

export interface MapCullEntry {
  mapId: number;
  mapWorldOffset: { x: number; y: number };
  mapWidthPx: number;
  mapHeightPx: number;
  borderOnly: boolean;
  isReady: () => boolean;
  sync: (projection: ViewportRectangle) => void;
  lastCull: { x: number; y: number } | null;
  setVisible: (visible: boolean) => void;
}

const entries = new Map<number, MapCullEntry>();

export const registerMapCullEntry = (entry: MapCullEntry): void => {
  entries.set(entry.mapId, entry);
};

export const unregisterMapCullEntry = (mapId: number): void => {
  entries.delete(mapId);
};

export const getMapCullEntries = (): MapCullEntry[] => [...entries.values()];

export const projectionIntersectsMap = (
  projection: ViewportRectangle,
  entry: MapCullEntry
): boolean => {
  const { x: ox, y: oy } = entry.mapWorldOffset;
  const right = ox + entry.mapWidthPx;
  const bottom = oy + entry.mapHeightPx;

  return (
    projection.x < right &&
    projection.x + projection.width > ox &&
    projection.y < bottom &&
    projection.y + projection.height > oy
  );
};

/** Current map: half-tile. Adjacent terrain-only: full tile. */
export const cullMovementThresholdPx = (borderOnly: boolean): number =>
  borderOnly ? 32 : 16;
