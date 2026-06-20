import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react';
import { Container, useTick } from '@inlet/react-pixi';
import { Container as PixiContainer, Filter } from 'pixi.js';
import lerp from 'lerp';

import { DebugGridSystem } from '@bao/client/components/Systems/DebugSystem';
import { useGameDebugPortal } from '@bao/client/components/Entities/TiledMap/useGameDebugPortal';
import { useBlockedTilesDebugPortal } from '@bao/client/components/Entities/TiledMap/useBlockedTilesDebugPortal';
import { useWaterDebugPortal } from '@bao/client/components/Entities/TiledMap/Water/useWaterDebugPortal';
import { DEBUG_SHOW_PIXI_TILE_GRID } from '@bao/client/components/Entities/TiledMap/debugFlags';
import { useGameContext } from '@bao/client/components/Game';
import {
  SetStateCallback,
  UpdateStateCallback,
  useLocalStateReducer
} from '@bao/client/hooks';
import { App } from '@bao/core/constants/game';
import { TILE_SIZE } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import {
  getCharacterWorldPixels,
  useWorldContext
} from '@bao/client/components/Systems/WorldSystem';
import { worldViewportRef } from '@bao/client/lib/world-viewport';
import { localCharacterRef } from '@bao/client/lib/game-server-state';
import { resolveLocalCharacter } from '@bao/client/lib/resolve-local-character';

export { resolveLocalCharacter };

export interface ViewportProps {
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle extends Vector2 {
  width: number;
  height: number;
}
export interface ViewportSystemState {
  currentCharacter: CharacterState | null;
  filter: Filter | null;
  projection: Rectangle;
}

export interface ViewportContextState {
  setViewportState: SetStateCallback<ViewportSystemState> | null;
  updateViewportState: UpdateStateCallback<ViewportSystemState> | null;
  viewportState: ViewportSystemState;
  projectionRef: React.MutableRefObject<Rectangle>;
  displayPositionRef: React.MutableRefObject<Vector2>;
}

const DISPLAY_LERP = 1 / 3;
const SNAP_DISTANCE_PX = TILE_SIZE * 2;
/** Publish React viewport state every N tile steps (sub-tile motion stays Pixi-only). */
const TILE_PUBLISH_HYSTERESIS = 2;

export const createInitialViewportState = (): ViewportSystemState => ({
  currentCharacter: null,
  filter: null,
  projection: {
    height: App.canvasHeight,
    width: App.canvasWidth,
    x: 0,
    y: 0
  }
});

const initialProjection = createInitialViewportState().projection;

export const ViewportContext = createContext<ViewportContextState>({
  setViewportState: null,
  updateViewportState: null,
  viewportState: createInitialViewportState(),
  projectionRef: { current: initialProjection },
  displayPositionRef: { current: { x: 0, y: 0 } }
});

export const useViewportContext = () => {
  return useContext(ViewportContext);
};

export const ViewportSystem: React.FC<ViewportProps> = (
  props: ViewportProps
) => {
  const [viewportState, setViewportState, , updateViewportState] =
    useLocalStateReducer(createInitialViewportState());
  const viewport = useRef<PixiContainer>(null);
  const projectionRef = useRef(viewportState.projection);
  const displayPositionRef = useRef({ x: 0, y: 0 });
  const publishedProjectionTileRef = useRef({ x: Number.NaN, y: Number.NaN });
  const lastSnapKeyRef = useRef<string | null>(null);
  const lastSnappedMapIdRef = useRef<number | null>(null);
  const { state } = useGameContext();
  const { worlds, currentMapId } = useWorldContext();
  const { room, characterId, debug } = state;
  const { children, overlay } = props;

  useGameDebugPortal(Boolean(debug), projectionRef);
  useBlockedTilesDebugPortal(Boolean(debug), projectionRef);
  useWaterDebugPortal(Boolean(debug), projectionRef);

  const applyProjection = (
    projection: Rectangle,
    character: CharacterState | null,
    publish: boolean
  ) => {
    projectionRef.current = projection;
    worldViewportRef.current = projection;

    if (viewport.current) {
      viewport.current.x = -projection.x;
      viewport.current.y = -projection.y;
    }

    if (!publish) {
      return;
    }

    setViewportState({
      currentCharacter: character,
      projection
    });
  };

  const snapCameraToDisplay = (character: CharacterState) => {
    const projection = {
      ...projectionRef.current,
      x: displayPositionRef.current.x - projectionRef.current.width / 2,
      y: displayPositionRef.current.y - projectionRef.current.height / 2
    };

    publishedProjectionTileRef.current = {
      x: Math.floor(projection.x / TILE_SIZE),
      y: Math.floor(projection.y / TILE_SIZE)
    };

    applyProjection(projection, character, true);
  };

  const snapCameraToCharacter = (character: CharacterState) => {
    const worldPixels = getCharacterWorldPixels(character, worlds);
    displayPositionRef.current.x = worldPixels.x;
    displayPositionRef.current.y = worldPixels.y;
    snapCameraToDisplay(character);
  };

  const hadWorldsRef = useRef(false);

  useLayoutEffect(() => {
    const currentCharacter = localCharacterRef.current;
    if (!currentCharacter) {
      lastSnapKeyRef.current = null;
      lastSnappedMapIdRef.current = null;
      hadWorldsRef.current = false;
      publishedProjectionTileRef.current = { x: Number.NaN, y: Number.NaN };
      return;
    }

    const snapKey = room?.sessionId ?? characterId ?? '';
    const mapChanged = currentCharacter.mapId !== lastSnappedMapIdRef.current;
    const sessionChanged = lastSnapKeyRef.current !== snapKey;
    const worldsJustLoaded = Boolean(worlds) && !hadWorldsRef.current;

    if (worlds) {
      hadWorldsRef.current = true;
    }

    if (!sessionChanged && !mapChanged && !worldsJustLoaded) {
      return;
    }

    if (sessionChanged) {
      lastSnapKeyRef.current = snapKey;
    }

    if (mapChanged) {
      lastSnappedMapIdRef.current = currentCharacter.mapId ?? null;
    }

    snapCameraToCharacter(currentCharacter);
  }, [room?.sessionId, characterId, worlds, currentMapId]);

  useTick((delta = 1) => {
    const currentCharacter = localCharacterRef.current;
    if (!currentCharacter) {
      return;
    }

    if (currentCharacter.mapId !== lastSnappedMapIdRef.current) {
      lastSnappedMapIdRef.current = currentCharacter.mapId ?? null;
      snapCameraToCharacter(currentCharacter);
      return;
    }

    const worldPixels = getCharacterWorldPixels(currentCharacter, worlds);
    const targetX = worldPixels.x;
    const targetY = worldPixels.y;
    const dx = Math.abs(displayPositionRef.current.x - targetX);
    const dy = Math.abs(displayPositionRef.current.y - targetY);

    if (dx > SNAP_DISTANCE_PX || dy > SNAP_DISTANCE_PX) {
      displayPositionRef.current.x = targetX;
      displayPositionRef.current.y = targetY;
    } else {
      const t = 1 - Math.pow(1 - DISPLAY_LERP, delta);
      displayPositionRef.current.x = lerp(
        displayPositionRef.current.x,
        targetX,
        t
      );
      displayPositionRef.current.y = lerp(
        displayPositionRef.current.y,
        targetY,
        t
      );
    }

    const { width, height } = projectionRef.current;
    const x = displayPositionRef.current.x - width / 2;
    const y = displayPositionRef.current.y - height / 2;

    const projection = {
      ...projectionRef.current,
      x,
      y
    };

    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    const prevTile = publishedProjectionTileRef.current;
    const tileDeltaX = Math.abs(tileX - prevTile.x);
    const tileDeltaY = Math.abs(tileY - prevTile.y);
    const tileChanged =
      (Number.isNaN(prevTile.x) ||
        tileDeltaX >= TILE_PUBLISH_HYSTERESIS ||
        tileDeltaY >= TILE_PUBLISH_HYSTERESIS) &&
      (tileX !== prevTile.x || tileY !== prevTile.y);

    applyProjection(projection, currentCharacter, tileChanged);

    if (tileChanged) {
      publishedProjectionTileRef.current = { x: tileX, y: tileY };
    }
  });

  const viewportContext = useMemo(
    () => ({
      setViewportState,
      updateViewportState,
      viewportState,
      projectionRef,
      displayPositionRef
    }),
    [setViewportState, updateViewportState, viewportState]
  );

  return (
    <ViewportContext.Provider value={viewportContext}>
      {viewportState && (
        <>
          <Container ref={viewport}>
            {state.debug && DEBUG_SHOW_PIXI_TILE_GRID && <DebugGridSystem />}
            {children}
          </Container>
          {overlay}
        </>
      )}
    </ViewportContext.Provider>
  );
};
