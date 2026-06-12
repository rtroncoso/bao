import { useEffect, useRef } from 'react';

import { getQuadrant, TILED_MAP_SIZE, WorldQuadrant } from '@bao/core';
import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';

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
  const { state: gameState } = useGameContext();
  const { prefetchForCharacter, currentMapId, worlds } = useWorldContext();
  const localCharacter = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );
  const quadrantRef = useRef<WorldQuadrant | null>(null);
  const lastPrefetchKeyRef = useRef<string | null>(null);
  const lastMapIdRef = useRef<number | null>(null);
  const hadWorldsRef = useRef(false);

  const mapId = localCharacter?.mapId ?? currentMapId;
  const tileX = localCharacter?.tile.x;
  const tileY = localCharacter?.tile.y;

  useEffect(() => {
    if (mapId !== lastMapIdRef.current) {
      lastMapIdRef.current = mapId ?? null;
      quadrantRef.current = null;
      lastPrefetchKeyRef.current = null;
    }
  }, [mapId]);

  useEffect(() => {
    if (worlds && !hadWorldsRef.current) {
      hadWorldsRef.current = true;
      quadrantRef.current = null;
      lastPrefetchKeyRef.current = null;
    }
  }, [worlds]);

  useEffect(() => {
    if (!localCharacter || tileX === undefined || tileY === undefined) {
      quadrantRef.current = null;
      lastPrefetchKeyRef.current = null;
      return;
    }

    const quadrant = getQuadrantWithHysteresis(
      tileX,
      tileY,
      quadrantRef.current
    );
    const prefetchKey = `${mapId}:${quadrant}:${worlds ? 'w' : 'n'}`;

    if (lastPrefetchKeyRef.current === prefetchKey) {
      return;
    }

    quadrantRef.current = quadrant;
    lastPrefetchKeyRef.current = prefetchKey;
    void prefetchForCharacter(mapId, tileX, tileY, quadrant);
  }, [mapId, tileX, tileY, prefetchForCharacter, worlds]);
};
