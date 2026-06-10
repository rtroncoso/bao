import { useEffect, useMemo, useRef } from 'react';

import {
  getObjectLayersFromTmx,
  getWaterFromObjectLayers,
  Tiled
} from '@bao/core';

import TMX_MAP from '../../../../../../assets/public/maps/34.json';
import { getWaterPolygons } from '../Shore/waterPolygons';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

const DEBUG_HOST_ID = 'game-debug-overlay';
const DEBUG_LAYER_ID = 'game-debug-water';
const SVG_NS = 'http://www.w3.org/2000/svg';

const getMapWater = () =>
  getWaterFromObjectLayers(getObjectLayersFromTmx(TMX_MAP as unknown as Tiled));

const setViewBox = (svg: SVGSVGElement, projection: Rectangle) => {
  svg.setAttribute(
    'viewBox',
    `${projection.x} ${projection.y} ${projection.width} ${projection.height}`
  );
};

/** Paints water polygon debug into a DOM overlay synced to the live camera each frame. */
export const useWaterDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const shapes = useMemo(() => getWaterPolygons(getMapWater()), []);
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

      const element = document.createElementNS(SVG_NS, 'polygon');
      element.setAttribute(
        'points',
        polygon.map(({ x, y }) => `${x},${y}`).join(' ')
      );
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
