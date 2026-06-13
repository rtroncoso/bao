import { AudioEngine } from '@bao/audio';
import { WorldsJson } from '@bao/core';
import { WorldSfxPayload } from '@bao/core/constants/audio/Messages';

import {
  isMapTileInViewport,
  mapTileToWorldTile,
  worldViewportRef
} from '@bao/client/lib/world-viewport';

export const playWorldSfxIfInViewport = (
  engine: AudioEngine,
  payload: WorldSfxPayload,
  worlds: WorldsJson | null
): void => {
  const projection = worldViewportRef.current;
  if (
    !projection ||
    !isMapTileInViewport(
      payload.mapId,
      payload.x,
      payload.y,
      worlds,
      projection
    )
  ) {
    return;
  }

  const worldTile = mapTileToWorldTile(
    payload.mapId,
    payload.x,
    payload.y,
    worlds
  );

  engine.playSfxAt(payload.sfxId, worldTile.x, worldTile.y);
};
