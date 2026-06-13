import { TILE_SIZE, WorldsJson } from '@bao/core';

import type { Rectangle as ViewportProjection } from '@bao/client/components/Systems/ViewportSystem';
import { getMapWorldOffset } from '@bao/client/components/Systems/WorldSystem/worldUtils';

/** Updated each camera tick by ViewportSystem — readable outside the viewport tree. */
export const worldViewportRef: { current: ViewportProjection | null } = {
  current: null
};

export const ENTITY_SFX_VIEWPORT_PADDING = TILE_SIZE * 2;

export const isWorldPointInViewport = (
  worldX: number,
  worldY: number,
  width: number,
  height: number,
  projection: ViewportProjection,
  padding = ENTITY_SFX_VIEWPORT_PADDING
): boolean =>
  worldX + width >= projection.x - padding &&
  worldX <= projection.x + projection.width + padding &&
  worldY + height >= projection.y - padding &&
  worldY <= projection.y + projection.height + padding;

export const isMapTileInViewport = (
  mapId: number,
  tileX: number,
  tileY: number,
  worlds: WorldsJson | null,
  projection: ViewportProjection,
  tileSize = TILE_SIZE
): boolean => {
  const { x: worldTileX, y: worldTileY } = mapTileToWorldTile(
    mapId,
    tileX,
    tileY,
    worlds,
    tileSize
  );

  return isWorldPointInViewport(
    worldTileX * tileSize,
    worldTileY * tileSize,
    tileSize,
    tileSize,
    projection
  );
};

/** Map-local tile indices → unified world tile grid (matches camera / worlds.json). */
export const mapTileToWorldTile = (
  mapId: number,
  tileX: number,
  tileY: number,
  worlds: WorldsJson | null,
  tileSize = TILE_SIZE
): { x: number; y: number } => {
  const offset = getMapWorldOffset(mapId, worlds);

  return {
    x: Math.floor((offset.x + tileX * tileSize) / tileSize),
    y: Math.floor((offset.y + tileY * tileSize) / tileSize)
  };
};
