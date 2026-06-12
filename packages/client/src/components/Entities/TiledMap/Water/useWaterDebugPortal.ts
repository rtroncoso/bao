import { useEffect, useMemo, useRef } from 'react';

import {
  getObjectLayersFromTmx,
  getWaterFromObjectLayers,
  Tiled
} from '@bao/core';

import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { getWaterPolygons } from '../Shore/waterPolygons';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

const DEBUG_HOST_ID = 'game-debug-overlay';
const DEBUG_LAYER_ID = 'game-debug-water';
const SVG_NS = 'http://www.w3.org/2000/svg';

type Point = { x: number; y: number };
type Polygon = Point[];

const setViewBox = (svg: SVGSVGElement, projection: Rectangle) => {
  svg.setAttribute(
    'viewBox',
    `${projection.x} ${projection.y} ${projection.width} ${projection.height}`
  );
};

const offsetPolygons = (
  polygons: Polygon[],
  offsetX: number,
  offsetY: number
): Polygon[] =>
  polygons.map((polygon) =>
    polygon.map(({ x, y }) => ({ x: x + offsetX, y: y + offsetY }))
  );

const collectWaterPolygonsForMaps = (
  activeMaps: Array<{
    map: Tiled;
    offsetX: number;
    offsetY: number;
  }>
): Polygon[] =>
  activeMaps.flatMap(({ map, offsetX, offsetY }) =>
    offsetPolygons(
      getWaterPolygons(getWaterFromObjectLayers(getObjectLayersFromTmx(map))),
      offsetX,
      offsetY
    )
  );

/** Paints water polygon debug into a DOM overlay synced to the live camera each frame. */
export const useWaterDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const { activeMaps } = useWorldContext();
  const shapes = useMemo(
    () => collectWaterPolygonsForMaps(activeMaps),
    [activeMaps]
  );
  const projectionRefStable = useRef(projectionRef);
  projectionRefStable.current = projectionRef;

  useEffect(() => {
    const host = document.getElementById(DEBUG_HOST_ID);
    if (!host) {
      return;
    }

    document.getElementById(DEBUG_LAYER_ID)?.remove();

    if (!enabled || !shapes.length) {
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

    setViewBox(svg, projectionRefStable.current.current);

    shapes.forEach((polygon) => {
      if (polygon.length < 3) {
        return;
      }

      const xs = polygon.map(({ x }) => x);
      const ys = polygon.map(({ y }) => y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const isAxisAlignedRect =
        polygon.length === 4 &&
        xs.every((x) => x === minX || x === maxX) &&
        ys.every((y) => y === minY || y === maxY);

      const element = document.createElementNS(
        SVG_NS,
        isAxisAlignedRect ? 'rect' : 'polygon'
      );

      if (isAxisAlignedRect) {
        element.setAttribute('x', String(minX));
        element.setAttribute('y', String(minY));
        element.setAttribute('width', String(maxX - minX));
        element.setAttribute('height', String(maxY - minY));
      } else {
        element.setAttribute(
          'points',
          polygon.map(({ x, y }) => `${x},${y}`).join(' ')
        );
      }

      element.setAttribute('fill', 'rgba(51, 136, 255, 0.22)');
      element.setAttribute('stroke', 'rgba(255, 68, 68, 0.75)');
      element.setAttribute('stroke-width', '2');
      element.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(element);
    });

    host.appendChild(svg);

    let frameId = 0;
    const syncProjection = () => {
      setViewBox(svg, projectionRefStable.current.current);
      frameId = requestAnimationFrame(syncProjection);
    };

    frameId = requestAnimationFrame(syncProjection);

    return () => {
      cancelAnimationFrame(frameId);
      svg.remove();
    };
  }, [enabled, shapes]);
};
