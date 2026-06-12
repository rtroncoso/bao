import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { TILE_SIZE } from '@bao/core';

import { useGameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { useWorldContext } from '@bao/client/components/Systems/WorldSystem';
import { selectManifest } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { DEBUG_SHOW_BLOCKED_TILES } from './debugFlags';

import type { Rectangle } from '@bao/client/components/Systems/ViewportSystem';

const DEBUG_HOST_ID = 'game-debug-overlay';
const DEBUG_LAYER_ID = 'game-debug-blocked-tiles';
const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWPORT_PADDING = TILE_SIZE * 2;

interface BlockedTile {
  x: number;
  y: number;
}

interface MapMeta {
  blockedTiles?: BlockedTile[];
}

const getAssetsBaseUrl = () =>
  process.env.NEXT_PUBLIC_BAO_ASSETS?.replace(/\/$/, '') ?? '';

const setViewBox = (svg: SVGSVGElement, projection: Rectangle) => {
  svg.setAttribute(
    'viewBox',
    `${projection.x} ${projection.y} ${projection.width} ${projection.height}`
  );
};

const isTileInProjection = (
  worldX: number,
  worldY: number,
  projection: Rectangle
) =>
  worldX + TILE_SIZE >= projection.x - VIEWPORT_PADDING &&
  worldX <= projection.x + projection.width + VIEWPORT_PADDING &&
  worldY + TILE_SIZE >= projection.y - VIEWPORT_PADDING &&
  worldY <= projection.y + projection.height + VIEWPORT_PADDING;

/** Paints blocked-tile debug boxes from map meta sidecars (viewport-culled). */
export const useBlockedTilesDebugPortal = (
  enabled: boolean,
  projectionRef: React.MutableRefObject<Rectangle>
): void => {
  const manifest = useSelector((state: State) => selectManifest(state));
  const { state: gameState } = useGameContext();
  const { activeMaps } = useWorldContext();
  const localCharacter = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );
  const debugMapId = localCharacter?.mapId;
  const [blockedByMapId, setBlockedByMapId] = useState<
    Record<number, BlockedTile[]>
  >({});
  const projectionRefStable = useRef(projectionRef);
  projectionRefStable.current = projectionRef;

  useEffect(() => {
    if (!enabled || !DEBUG_SHOW_BLOCKED_TILES || !debugMapId) {
      setBlockedByMapId({});
      return;
    }

    let cancelled = false;
    const mapPath = manifest?.maps?.[String(debugMapId)];
    if (!mapPath) {
      return;
    }

    const load = async () => {
      const metaPath = mapPath.replace(/\.json$/, '.meta.json');
      const response = await fetch(`${getAssetsBaseUrl()}/${metaPath}`);
      if (!response.ok || cancelled) {
        return;
      }

      const meta = (await response.json()) as MapMeta;
      if (!cancelled) {
        setBlockedByMapId({ [debugMapId]: meta.blockedTiles ?? [] });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [debugMapId, enabled, manifest?.maps]);

  const tilesByMap = useMemo(() => {
    const active = activeMaps.find(({ mapId }) => mapId === debugMapId);
    if (!active) {
      return [];
    }

    return (blockedByMapId[debugMapId] ?? []).map((tile) => ({
      x: active.offsetX + tile.x * TILE_SIZE,
      y: active.offsetY + tile.y * TILE_SIZE
    }));
  }, [activeMaps, blockedByMapId, debugMapId]);

  useEffect(() => {
    const host = document.getElementById(DEBUG_HOST_ID);
    if (!host) {
      return;
    }

    document.getElementById(DEBUG_LAYER_ID)?.remove();

    if (!enabled || !DEBUG_SHOW_BLOCKED_TILES || !tilesByMap.length) {
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

    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('id', 'blocked-tiles-group');
    svg.appendChild(group);
    host.appendChild(svg);

    let frameId = 0;
    let lastTileKey = '';

    const sync = () => {
      const projection = projectionRefStable.current.current;
      setViewBox(svg, projection);

      const visible = tilesByMap.filter(({ x, y }) =>
        isTileInProjection(x, y, projection)
      );
      const tileKey = `${Math.floor(projection.x / TILE_SIZE)}:${Math.floor(
        projection.y / TILE_SIZE
      )}:${visible.length}`;

      if (tileKey !== lastTileKey) {
        lastTileKey = tileKey;
        while (group.firstChild) {
          group.removeChild(group.firstChild);
        }

        visible.forEach(({ x, y }) => {
          const rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(y));
          rect.setAttribute('width', String(TILE_SIZE));
          rect.setAttribute('height', String(TILE_SIZE));
          rect.setAttribute('fill', 'rgba(255, 64, 64, 0.18)');
          rect.setAttribute('stroke', 'rgba(255, 64, 64, 0.85)');
          rect.setAttribute('stroke-width', '1');
          rect.setAttribute('vector-effect', 'non-scaling-stroke');
          group.appendChild(rect);
        });
      }

      frameId = requestAnimationFrame(sync);
    };

    sync();

    return () => {
      cancelAnimationFrame(frameId);
      svg.remove();
    };
  }, [enabled, tilesByMap]);
};
