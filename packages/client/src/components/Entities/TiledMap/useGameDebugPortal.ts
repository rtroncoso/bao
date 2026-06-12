import { useEffect, useRef } from 'react';

import { TILE_SIZE } from '@bao/core';

import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';

import { DEBUG_SHOW_SHG_CELL_GRID } from './debugFlags';
import { spatialDebugRef } from './spatialDebug';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

const DEBUG_HOST_ID = 'game-debug-overlay';
const SHG_LAYER_ID = 'game-debug-shg';
const SVG_NS = 'http://www.w3.org/2000/svg';

type Bounds = { x: number; y: number; width: number; height: number };

const EMPTY_BOUNDS: Bounds = { x: 0, y: 0, width: 0, height: 0 };

const setViewBox = (svg: SVGSVGElement, projection: Rectangle) => {
  svg.setAttribute(
    'viewBox',
    `${projection.x} ${projection.y} ${projection.width} ${projection.height}`
  );
};

const createRect = (
  parent: SVGGElement,
  stroke: string,
  fill: string,
  dash?: string
): SVGRectElement => {
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('fill', fill);
  rect.setAttribute('stroke', stroke);
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('vector-effect', 'non-scaling-stroke');
  if (dash) {
    rect.setAttribute('stroke-dasharray', dash);
  }
  parent.appendChild(rect);
  return rect;
};

const updateRect = (rect: SVGRectElement, bounds: Bounds) => {
  rect.setAttribute('x', String(bounds.x));
  rect.setAttribute('y', String(bounds.y));
  rect.setAttribute('width', String(bounds.width));
  rect.setAttribute('height', String(bounds.height));
};

const updateShgCellGridPath = (
  path: SVGPathElement,
  objectBounds: Bounds,
  cellSize: number
) => {
  const { x, y, width, height } = objectBounds;
  if (width <= 0 || height <= 0) {
    path.setAttribute('d', '');
    return;
  }

  const minCellX = Math.floor(x / cellSize) * cellSize;
  const maxCellX = Math.ceil((x + width) / cellSize) * cellSize;
  const minCellY = Math.floor(y / cellSize) * cellSize;
  const maxCellY = Math.ceil((y + height) / cellSize) * cellSize;

  let d = '';
  for (let cellX = minCellX; cellX <= maxCellX; cellX += cellSize) {
    d += `M${cellX} ${minCellY}V${maxCellY}`;
  }
  for (let cellY = minCellY; cellY <= maxCellY; cellY += cellSize) {
    d += `M${minCellX} ${cellY}H${maxCellX}`;
  }

  path.setAttribute('d', d);
};

const shgCullSyncKey = (
  projection: Rectangle,
  snapshot: NonNullable<typeof spatialDebugRef.current>,
  liveMapId?: number
) =>
  [
    Math.floor(projection.x / TILE_SIZE),
    Math.floor(projection.y / TILE_SIZE),
    liveMapId,
    snapshot.mapId,
    snapshot.mapWorldOffset.x,
    snapshot.mapWorldOffset.y,
    Math.floor(snapshot.tileBounds.x / TILE_SIZE),
    Math.floor(snapshot.tileBounds.y / TILE_SIZE),
    Math.floor(snapshot.spriteBounds.x / TILE_SIZE),
    Math.floor(snapshot.spriteBounds.y / TILE_SIZE),
    snapshot.spriteQueryCount,
    snapshot.objectQueryCount,
    snapshot.characterPosition?.mapId,
    snapshot.characterPosition?.x,
    snapshot.characterPosition?.y
  ].join(':');

const createDebugSvg = (id: string) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = id;
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';
  svg.style.overflow = 'visible';
  return svg;
};

/** DOM overlay for spatial-hash culling bounds and player position (debug mode). */
export const useGameDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const { state: gameState } = useGameContext();
  const projectionRefStable = useRef(projectionRef);
  projectionRefStable.current = projectionRef;
  const liveCharacterRef = useRef(
    resolveLocalCharacter(
      gameState?.serverState,
      gameState?.characterId,
      gameState?.room?.sessionId
    )
  );
  liveCharacterRef.current = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );

  useEffect(() => {
    const host = document.getElementById(DEBUG_HOST_ID);
    if (!host) {
      return;
    }

    document.getElementById(SHG_LAYER_ID)?.remove();

    if (!enabled) {
      return;
    }

    const shgSvg = createDebugSvg(SHG_LAYER_ID);
    const shgGroup = document.createElementNS(SVG_NS, 'g');
    shgGroup.setAttribute('id', 'shg-debug-layer');
    const labelGroup = document.createElementNS(SVG_NS, 'g');
    labelGroup.setAttribute('id', 'shg-debug-labels');

    const tileRect = createRect(
      shgGroup,
      'rgba(80, 160, 255, 0.85)',
      'rgba(80, 160, 255, 0.05)',
      '8 4'
    );
    const spriteRect = createRect(
      shgGroup,
      'rgba(80, 255, 120, 0.9)',
      'rgba(80, 255, 120, 0.06)',
      '4 4'
    );
    const objectRect = createRect(
      shgGroup,
      'rgba(120, 200, 255, 0.7)',
      'rgba(120, 200, 255, 0.03)',
      '2 6'
    );
    const cameraRect = createRect(
      shgGroup,
      'rgba(255, 255, 0, 0.9)',
      'rgba(255, 255, 0, 0.04)'
    );

    const gridPath = document.createElementNS(SVG_NS, 'path');
    gridPath.setAttribute('fill', 'none');
    gridPath.setAttribute('stroke', 'rgba(80, 255, 120, 0.35)');
    gridPath.setAttribute('stroke-width', '1');
    gridPath.setAttribute('vector-effect', 'non-scaling-stroke');
    gridPath.style.display = DEBUG_SHOW_SHG_CELL_GRID ? '' : 'none';
    shgGroup.appendChild(gridPath);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('fill', 'rgba(255, 255, 255, 0.92)');
    label.setAttribute('font-family', 'monospace');
    label.setAttribute('font-size', '12');
    labelGroup.appendChild(label);

    shgSvg.appendChild(shgGroup);
    shgSvg.appendChild(labelGroup);
    host.appendChild(shgSvg);

    let frameId = 0;
    let lastCullKey = '';
    let lastLiveMapId: number | undefined;

    const syncFrame = (projection: Rectangle) => {
      setViewBox(shgSvg, projection);
      updateRect(cameraRect, projection);
      label.setAttribute('x', String(projection.x + 8));
      label.setAttribute('y', String(projection.y + 20));
    };

    const syncCull = (_projection: Rectangle) => {
      const liveCharacter = liveCharacterRef.current;
      const snapshot = spatialDebugRef.current;
      const liveMapId = liveCharacter?.mapId;

      if (!liveCharacter) {
        label.textContent = 'SHG waiting for character…';
        updateRect(tileRect, EMPTY_BOUNDS);
        updateRect(spriteRect, EMPTY_BOUNDS);
        updateRect(objectRect, EMPTY_BOUNDS);
        gridPath.setAttribute('d', '');
        return;
      }

      if (!snapshot || snapshot.mapId !== liveMapId) {
        label.textContent = `SHG waiting for map ${liveMapId}…`;
        updateRect(tileRect, EMPTY_BOUNDS);
        updateRect(spriteRect, EMPTY_BOUNDS);
        updateRect(objectRect, EMPTY_BOUNDS);
        gridPath.setAttribute('d', '');
        return;
      }

      updateRect(tileRect, snapshot.tileBounds);
      updateRect(spriteRect, snapshot.spriteBounds);
      updateRect(objectRect, snapshot.objectBounds);

      if (DEBUG_SHOW_SHG_CELL_GRID) {
        updateShgCellGridPath(
          gridPath,
          snapshot.spriteBounds,
          snapshot.cellSize
        );
      }

      const positionLine = `world [${liveCharacter.worldX}, ${liveCharacter.worldY}] map ${liveCharacter.mapId} tile [${liveCharacter.tile.x}, ${liveCharacter.tile.y}]`;

      label.textContent = [
        positionLine,
        `SHG ${snapshot.cellSize / TILE_SIZE}t (${snapshot.cellSize}px)`,
        `sprites ${snapshot.spriteQueryCount}`,
        `objects ${snapshot.objectQueryCount}`
      ].join(' | ');
    };

    const sync = () => {
      const projection = projectionRefStable.current.current;
      const snapshot = spatialDebugRef.current;
      const liveMapId = liveCharacterRef.current?.mapId;

      syncFrame(projection);

      if (liveMapId !== lastLiveMapId) {
        lastLiveMapId = liveMapId;
        lastCullKey = '';
      }

      const cullKey = snapshot
        ? shgCullSyncKey(projection, snapshot, liveMapId)
        : `waiting:${liveMapId ?? 'none'}`;
      if (cullKey !== lastCullKey) {
        lastCullKey = cullKey;
        syncCull(projection);
      }

      frameId = requestAnimationFrame(sync);
    };

    syncFrame(projectionRefStable.current.current);
    syncCull(projectionRefStable.current.current);
    frameId = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frameId);
      shgSvg.remove();
    };
  }, [enabled]);
};
