import { useEffect, useMemo, useRef } from 'react';
import { Rectangle as PixiRectangle } from 'pixi.js';

import {
  calculateProjectionMatrix,
  getObjectLayersFromTmx,
  getWaterFromObjectLayers,
  Tiled,
  TILE_SIZE
} from '@bao/core';

import TMX_MAP from '../../../../../assets/public/maps/34.json';
import { SHORE_SPRITE_EXTRA_CULL_PX } from './constants';
import { DEBUG_SHOW_SHG_CELL_GRID } from './debugFlags';
import { getWaterPolygons } from './Shore/waterPolygons';
import { spatialDebugRef } from './spatialDebug';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

const DEBUG_HOST_ID = 'game-debug-overlay';
const WATER_LAYER_ID = 'game-debug-water';
const SHG_LAYER_ID = 'game-debug-shg';
const SVG_NS = 'http://www.w3.org/2000/svg';

type Bounds = { x: number; y: number; width: number; height: number };

const getMapWater = () =>
  getWaterFromObjectLayers(getObjectLayersFromTmx(TMX_MAP as unknown as Tiled));

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
  snapshot: NonNullable<typeof spatialDebugRef.current>
) =>
  [
    Math.floor(projection.x / TILE_SIZE),
    Math.floor(projection.y / TILE_SIZE),
    snapshot.spriteQueryCount,
    snapshot.objectQueryCount
  ].join(':');

const createDebugSvg = (id: string) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = id;
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('shape-rendering', 'optimizeSpeed');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';
  svg.style.overflow = 'hidden';
  svg.style.contain = 'strict';
  return svg;
};

/** Single RAF loop for water + SHG DOM debug overlays; DOM writes only on tile-step changes. */
export const useGameDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const waterShapes = useMemo(() => getWaterPolygons(getMapWater()), []);
  const projectionRefStable = useRef(projectionRef);
  projectionRefStable.current = projectionRef;

  useEffect(() => {
    const host = document.getElementById(DEBUG_HOST_ID);
    if (!host) {
      return;
    }

    document.getElementById(WATER_LAYER_ID)?.remove();
    document.getElementById(SHG_LAYER_ID)?.remove();

    if (!enabled) {
      return;
    }

    const waterSvg =
      waterShapes.length > 0 ? createDebugSvg(WATER_LAYER_ID) : null;
    if (waterSvg) {
      waterShapes.forEach((polygon) => {
        if (polygon.length < 3) {
          return;
        }

        const element = document.createElementNS(SVG_NS, 'polygon');
        element.setAttribute(
          'points',
          polygon.map(({ x, y }) => `${x},${y}`).join(' ')
        );
        element.setAttribute('fill', 'rgba(51, 136, 255, 0.22)');
        element.setAttribute('stroke', 'rgba(255, 68, 68, 0.75)');
        element.setAttribute('stroke-width', '2');
        waterSvg.appendChild(element);
      });
      host.appendChild(waterSvg);
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

    /** Cheap: pans debug overlays with the live camera each frame. */
    const syncFrame = (projection: Rectangle) => {
      if (waterSvg) {
        setViewBox(waterSvg, projection);
      }
      setViewBox(shgSvg, projection);
      updateRect(cameraRect, projection);
      label.setAttribute('x', String(projection.x + 8));
      label.setAttribute('y', String(projection.y + 20));
    };

    /** Expensive: culling rects + cell grid geometry — only on tile/cull changes. */
    const syncCull = (projection: Rectangle) => {
      const snapshot = spatialDebugRef.current;
      if (!snapshot?.tmx) {
        return;
      }

      const camera = new PixiRectangle(
        projection.x,
        projection.y,
        projection.width,
        projection.height
      );
      const tileBounds = calculateProjectionMatrix(
        snapshot.tmx,
        camera,
        snapshot.tileCullingPx
      );
      const spriteBounds = calculateProjectionMatrix(
        snapshot.tmx,
        camera,
        snapshot.objectCullingPx + SHORE_SPRITE_EXTRA_CULL_PX
      );
      const objectBounds = calculateProjectionMatrix(
        snapshot.tmx,
        camera,
        snapshot.objectCullingPx
      );

      updateRect(tileRect, tileBounds);
      updateRect(spriteRect, spriteBounds);
      updateRect(objectRect, objectBounds);

      if (DEBUG_SHOW_SHG_CELL_GRID) {
        updateShgCellGridPath(gridPath, spriteBounds, snapshot.cellSize);
      }

      label.textContent = [
        `SHG cell ${snapshot.cellSize / TILE_SIZE}t (${snapshot.cellSize}px)`,
        `sprites ${snapshot.spriteQueryCount}`,
        `objects ${snapshot.objectQueryCount}`,
        `tile [${tileBounds.x | 0},${tileBounds.y | 0}]`,
        `spr [${spriteBounds.x | 0},${spriteBounds.y | 0}]`,
        `obj [${objectBounds.x | 0},${objectBounds.y | 0}]`
      ].join(' | ');
    };

    const sync = () => {
      const projection = projectionRefStable.current.current;
      const snapshot = spatialDebugRef.current;

      syncFrame(projection);

      const cullKey = snapshot?.tmx ? shgCullSyncKey(projection, snapshot) : '';
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
      waterSvg?.remove();
      shgSvg.remove();
    };
  }, [enabled, waterShapes]);
};
