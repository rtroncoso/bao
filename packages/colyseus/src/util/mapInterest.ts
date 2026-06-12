import type { WorldsJson } from '@bao/core/loaders/maps/world';
import { toWorldTile } from '@bao/core/loaders/maps/world';

export const PLAYABLE_WIDTH = 84;
export const PLAYABLE_HEIGHT = 88;
export const INTEREST_RADIUS_TILES = 96;

const getMapWorldOrigin = (
  mapId: number,
  worlds: WorldsJson | null
): { worldX: number; worldY: number } => {
  const world = toWorldTile(mapId, 0, 0, worlds ?? emptyWorlds());
  return { worldX: world.worldX, worldY: world.worldY };
};

const emptyWorlds = (): WorldsJson => ({
  maps: [],
  onlyShowAdjacentMaps: false,
  type: 'world'
});

export const isMapVisibleToCharacter = (
  mapId: number,
  characterMapId: number,
  characterX: number,
  characterY: number,
  worlds: WorldsJson | null = null
): boolean => {
  if (mapId === characterMapId) {
    return true;
  }

  const characterWorld = toWorldTile(
    characterMapId,
    characterX,
    characterY,
    worlds ?? emptyWorlds()
  );
  const mapWorld = getMapWorldOrigin(mapId, worlds);

  const dx = Math.max(
    mapWorld.worldX - (characterWorld.worldX + INTEREST_RADIUS_TILES),
    characterWorld.worldX -
      INTEREST_RADIUS_TILES -
      (mapWorld.worldX + PLAYABLE_WIDTH)
  );
  const dy = Math.max(
    mapWorld.worldY - (characterWorld.worldY + INTEREST_RADIUS_TILES),
    characterWorld.worldY -
      INTEREST_RADIUS_TILES -
      (mapWorld.worldY + PLAYABLE_HEIGHT)
  );

  return dx <= 0 && dy <= 0;
};

export const isEntityNearCharacter = (
  entityX: number,
  entityY: number,
  characterMapId: number,
  characterX: number,
  characterY: number,
  entityMapId: number,
  worlds: WorldsJson | null = null
): boolean => {
  if (entityMapId !== characterMapId) {
    return isMapVisibleToCharacter(
      entityMapId,
      characterMapId,
      characterX,
      characterY,
      worlds
    );
  }

  const dx = Math.abs(entityX - characterX);
  const dy = Math.abs(entityY - characterY);
  return dx <= INTEREST_RADIUS_TILES && dy <= INTEREST_RADIUS_TILES;
};
