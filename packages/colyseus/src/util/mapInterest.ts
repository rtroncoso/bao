export const PLAYABLE_WIDTH = 84;
export const PLAYABLE_HEIGHT = 88;
export const INTEREST_RADIUS_TILES = 96;

export const isMapVisibleToCharacter = (
  mapId: number,
  characterMapId: number,
  characterX: number,
  characterY: number
): boolean => {
  if (mapId === characterMapId) {
    return true;
  }

  const characterWorldX = characterMapId * PLAYABLE_WIDTH + characterX;
  const characterWorldY = characterY;
  const mapWorldX = mapId * PLAYABLE_WIDTH;
  const mapWorldY = 0;

  const dx = Math.max(
    mapWorldX - (characterWorldX + INTEREST_RADIUS_TILES),
    characterWorldX - INTEREST_RADIUS_TILES - (mapWorldX + PLAYABLE_WIDTH)
  );
  const dy = Math.max(
    mapWorldY - (characterWorldY + INTEREST_RADIUS_TILES),
    characterWorldY - INTEREST_RADIUS_TILES - (mapWorldY + PLAYABLE_HEIGHT)
  );

  return dx <= 0 && dy <= 0;
};

export const isEntityNearCharacter = (
  entityX: number,
  entityY: number,
  characterMapId: number,
  characterX: number,
  characterY: number,
  entityMapId: number
): boolean => {
  if (entityMapId !== characterMapId) {
    return isMapVisibleToCharacter(
      entityMapId,
      characterMapId,
      characterX,
      characterY
    );
  }

  const dx = Math.abs(entityX - characterX);
  const dy = Math.abs(entityY - characterY);
  return dx <= INTEREST_RADIUS_TILES && dy <= INTEREST_RADIUS_TILES;
};
