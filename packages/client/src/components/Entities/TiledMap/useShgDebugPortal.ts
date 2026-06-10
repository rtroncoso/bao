import { useEffect, useRef } from 'react';
import { Rectangle as PixiRectangle } from 'pixi.js';

import { calculateProjectionMatrix, TILE_SIZE } from '@bao/core';

import { SHORE_SPRITE_EXTRA_CULL_PX } from './constants';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

import { DEBUG_SHOW_SHG_CELL_GRID } from './debugFlags';
import { spatialDebugRef } from './spatialDebug';

const DEBUG_HOST_ID = 'game-debug-overlay';
const DEBUG_LAYER_ID = 'game-debug-shg';
const SVG_NS = 'http://www.w3.org/2000/svg';

const setViewBox = (svg: SVGSVGElement, projection: Rectangle) => {
  svg.setAttribute(
    'viewBox',
    `${projection.x} ${projection.y} ${projection.width} ${projection.height}`
  );
};

const appendRect = (
  parent: SVGGElement,
  bounds: { x: number; y: number; width: number; height: number },
  stroke: string,
  fill: string,
  dash?: string
) => {
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', String(bounds.x));
  rect.setAttribute('y', String(bounds.y));
  rect.setAttribute('width', String(bounds.width));
  rect.setAttribute('height', String(bounds.height));
  rect.setAttribute('fill', fill);
  rect.setAttribute('stroke', stroke);
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('vector-effect', 'non-scaling-stroke');
  if (dash) {
    rect.setAttribute('stroke-dasharray', dash);
  }
  parent.appendChild(rect);
};

const appendShgCellGrid = (
  shgGroup: SVGGElement,
  objectBounds: { x: number; y: number; width: number; height: number },
  cellSize: number
) => {
  const { x, y, width, height } = objectBounds;
  const minCellX = Math.floor(x / cellSize) * cellSize;
  const maxCellX = Math.ceil((x + width) / cellSize) * cellSize;
  const minCellY = Math.floor(y / cellSize) * cellSize;
  const maxCellY = Math.ceil((y + height) / cellSize) * cellSize;

  for (let cellX = minCellX; cellX <= maxCellX; cellX += cellSize) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(cellX));
    line.setAttribute('y1', String(minCellY));
    line.setAttribute('x2', String(cellX));
    line.setAttribute('y2', String(maxCellY));
    line.setAttribute('stroke', 'rgba(80, 255, 120, 0.35)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    shgGroup.appendChild(line);
  }

  for (let cellY = minCellY; cellY <= maxCellY; cellY += cellSize) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(minCellX));
    line.setAttribute('y1', String(cellY));
    line.setAttribute('x2', String(maxCellX));
    line.setAttribute('y2', String(cellY));
    line.setAttribute('stroke', 'rgba(80, 255, 120, 0.35)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    shgGroup.appendChild(line);
  }
};

const syncShgOverlay = (
  shgGroup: SVGGElement,
  labelGroup: SVGGElement,
  liveProjection: Rectangle
) => {
  const snapshot = spatialDebugRef.current;
  shgGroup.replaceChildren();
  labelGroup.replaceChildren();

  if (!snapshot?.tmx) {
    return;
  }

  const camera = new PixiRectangle(
    liveProjection.x,
    liveProjection.y,
    liveProjection.width,
    liveProjection.height
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

  appendRect(
    shgGroup,
    camera,
    'rgba(255, 255, 0, 0.9)',
    'rgba(255, 255, 0, 0.04)'
  );
  appendRect(
    shgGroup,
    tileBounds,
    'rgba(80, 160, 255, 0.85)',
    'rgba(80, 160, 255, 0.05)',
    '8 4'
  );
  appendRect(
    shgGroup,
    spriteBounds,
    'rgba(80, 255, 120, 0.9)',
    'rgba(80, 255, 120, 0.06)',
    '4 4'
  );
  appendRect(
    shgGroup,
    objectBounds,
    'rgba(120, 200, 255, 0.7)',
    'rgba(120, 200, 255, 0.03)',
    '2 6'
  );

  if (DEBUG_SHOW_SHG_CELL_GRID) {
    appendShgCellGrid(shgGroup, spriteBounds, snapshot.cellSize);
  }

  const label = document.createElementNS(SVG_NS, 'text');
  label.setAttribute('x', String(camera.x + 8));
  label.setAttribute('y', String(camera.y + 20));
  label.setAttribute('fill', 'rgba(255, 255, 255, 0.92)');
  label.setAttribute('font-family', 'monospace');
  label.setAttribute('font-size', '12');
  label.textContent = [
    `SHG cell ${snapshot.cellSize / TILE_SIZE}t (${snapshot.cellSize}px)`,
    `sprites ${snapshot.spriteQueryCount}`,
    `objects ${snapshot.objectQueryCount}`,
    `tile [${tileBounds.x | 0},${tileBounds.y | 0}]`,
    `spr [${spriteBounds.x | 0},${spriteBounds.y | 0}]`,
    `obj [${objectBounds.x | 0},${objectBounds.y | 0}]`
  ].join(' | ');
  labelGroup.appendChild(label);
};

/** DOM overlay for spatial-hash culling bounds (yellow=camera, blue=tiles, green=objects). */
export const useShgDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const projectionRefStable = useRef(projectionRef);
  projectionRefStable.current = projectionRef;

  useEffect(() => {
    const host = document.getElementById(DEBUG_HOST_ID);
    if (!host) {
      return;
    }

    const existing = document.getElementById(DEBUG_LAYER_ID);
    if (existing) {
      existing.remove();
    }

    if (!enabled) {
      return;
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.id = DEBUG_LAYER_ID;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';

    const shgGroup = document.createElementNS(SVG_NS, 'g');
    shgGroup.setAttribute('id', 'shg-debug-layer');
    const labelGroup = document.createElementNS(SVG_NS, 'g');
    labelGroup.setAttribute('id', 'shg-debug-labels');
    svg.appendChild(shgGroup);
    svg.appendChild(labelGroup);
    host.appendChild(svg);

    let frameId = 0;
    const sync = () => {
      const projection = projectionRefStable.current.current;
      setViewBox(svg, projection);
      syncShgOverlay(shgGroup, labelGroup, projection);
      frameId = requestAnimationFrame(sync);
    };

    frameId = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frameId);
      svg.remove();
    };
  }, [enabled]);
};
