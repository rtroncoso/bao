import { useEffect, useRef } from 'react';

import { getQuadrant, TILED_MAP_SIZE, WorldQuadrant } from '@bao/core';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { useViewportContext } from '@bao/client/components/Systems';

const HYSTERESIS_TILES = 8;
const [PLAYABLE_WIDTH, PLAYABLE_HEIGHT] = TILED_MAP_SIZE;
const MID_X = Math.floor(PLAYABLE_WIDTH / 2);
const MID_Y = Math.floor(PLAYABLE_HEIGHT / 2);

const getQuadrantWithHysteresis = (
  localX: number,
  localY: number,
  previous: WorldQuadrant | null
): WorldQuadrant => {
  if (!previous) {
    return getQuadrant(localX, localY);
  }

  const westBound = MID_X - HYSTERESIS_TILES;
  const eastBound = MID_X + HYSTERESIS_TILES;
  const northBound = MID_Y - HYSTERESIS_TILES;
  const southBound = MID_Y + HYSTERESIS_TILES;

  const west = localX < westBound;
  const east = localX > eastBound;
  const north = localY < northBound;
  const south = localY > southBound;

  if (west && north) {
    return 1;
  }
  if (east && north) {
    return 2;
  }
  if (west && south) {
    return 3;
  }
  if (east && south) {
    return 4;
  }

  return previous;
};

export const useBorderPrefetch = () => {
  const { prefetchForCharacter, currentMapId } = useWorldContext();
  const { viewportState } = useViewportContext();
  const quadrantRef = useRef<WorldQuadrant | null>(null);

  useEffect(() => {
    const character = viewportState?.currentCharacter;
    if (!character) {
      return;
    }

    const mapId = character.mapId ?? currentMapId;
    const { x, y } = character.tile;
    const quadrant = getQuadrantWithHysteresis(x, y, quadrantRef.current);
    quadrantRef.current = quadrant;

    void prefetchForCharacter(mapId, x, y, quadrant);
  }, [
    currentMapId,
    prefetchForCharacter,
    viewportState?.currentCharacter?.mapId,
    viewportState?.currentCharacter?.tile.x,
    viewportState?.currentCharacter?.tile.y
  ]);
};
