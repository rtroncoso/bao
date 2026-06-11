import { parseMapIdFromEntry, WorldsJson } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';

export interface MapWorldOffset {
  x: number;
  y: number;
}

export const getMapWorldOffset = (
  mapId: number,
  worlds: WorldsJson | null
): MapWorldOffset => {
  if (!worlds) {
    return { x: 0, y: 0 };
  }

  const entry = worlds.maps.find((map) => parseMapIdFromEntry(map) === mapId);

  return {
    x: entry?.x ?? 0,
    y: entry?.y ?? 0
  };
};

export const getCharacterWorldPixels = (
  character: CharacterState,
  worlds: WorldsJson | null
): MapWorldOffset => {
  const offset = getMapWorldOffset(character.mapId ?? 34, worlds);

  return {
    x: offset.x + character.x,
    y: offset.y + character.y
  };
};
