import { Container, DisplayObject, Rectangle } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

import { TILE_SIZE, getProperty, TileLayer } from '@bao/core';

export type SpatialBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BoundsResolver<T> = (item: T) => SpatialBounds;
export type IdResolver<T> = (item: T) => string | number;

export const intersectsBounds = (
  item: SpatialBounds,
  bounds: Rectangle | SpatialBounds
): boolean =>
  !(
    item.x + item.width < bounds.x ||
    item.x > bounds.x + bounds.width ||
    item.y + item.height < bounds.y ||
    item.y > bounds.y + bounds.height
  );

const cellKey = (cellX: number, cellY: number, gridWidth: number): number =>
  cellY * gridWidth + cellX;

export class SpatialHashGrid<T> {
  private readonly cellSize: number;
  private readonly gridWidth: number;
  private readonly cells = new Map<number, T[]>();
  private readonly resolveBounds: BoundsResolver<T>;
  private readonly resolveId: IdResolver<T>;

  constructor(
    cellSize: number,
    mapWidthPx: number,
    resolveBounds: BoundsResolver<T>,
    resolveId: IdResolver<T>
  ) {
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(mapWidthPx / cellSize);
    this.resolveBounds = resolveBounds;
    this.resolveId = resolveId;
  }

  static fromItems<T>(
    items: T[],
    cellSize: number,
    mapWidthPx: number,
    resolveBounds: BoundsResolver<T>,
    resolveId: IdResolver<T>
  ): SpatialHashGrid<T> {
    const grid = new SpatialHashGrid(
      cellSize,
      mapWidthPx,
      resolveBounds,
      resolveId
    );
    items.forEach((item) => grid.insert(item));
    return grid;
  }

  insert(item: T): void {
    const { x, y, width, height } = this.resolveBounds(item);
    const minCellX = Math.floor(x / this.cellSize);
    const minCellY = Math.floor(y / this.cellSize);
    const maxCellX = Math.floor((x + width) / this.cellSize);
    const maxCellY = Math.floor((y + height) / this.cellSize);

    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
        const key = cellKey(cellX, cellY, this.gridWidth);
        const bucket = this.cells.get(key);

        if (bucket) {
          bucket.push(item);
        } else {
          this.cells.set(key, [item]);
        }
      }
    }
  }

  query(bounds: Rectangle): T[] {
    const minCellX = Math.floor(bounds.x / this.cellSize);
    const minCellY = Math.floor(bounds.y / this.cellSize);
    const maxCellX = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const maxCellY = Math.floor((bounds.y + bounds.height) / this.cellSize);
    const seen = new Set<string | number>();
    const result: T[] = [];

    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
        const key = cellKey(cellX, cellY, this.gridWidth);
        const bucket = this.cells.get(key);

        if (!bucket) {
          continue;
        }

        for (const item of bucket) {
          const id = this.resolveId(item);
          if (seen.has(id)) {
            continue;
          }

          if (intersectsBounds(this.resolveBounds(item), bounds)) {
            seen.add(id);
            result.push(item);
          }
        }
      }
    }

    return result;
  }
}

export const getChunkRange = (
  bounds: Rectangle,
  chunkSizeTiles: number
): { minX: number; minY: number; maxX: number; maxY: number } => {
  const minTileX = Math.floor(bounds.x / TILE_SIZE);
  const minTileY = Math.floor(bounds.y / TILE_SIZE);
  const maxTileX = Math.floor((bounds.x + bounds.width) / TILE_SIZE);
  const maxTileY = Math.floor((bounds.y + bounds.height) / TILE_SIZE);

  return {
    minX: Math.floor(minTileX / chunkSizeTiles),
    minY: Math.floor(minTileY / chunkSizeTiles),
    maxX: Math.floor(maxTileX / chunkSizeTiles),
    maxY: Math.floor(maxTileY / chunkSizeTiles)
  };
};

const buildChunkKey = (
  layerIndex: number,
  chunkX: number,
  chunkY: number
): string => `${layerIndex}:${chunkX}:${chunkY}`;

export type TileLayerChunk = {
  displayObject: DisplayObject;
  layerIndex: number;
};

export const SHORE_TILE_CHUNK_NAME = 'shore-tile-chunk';

export class TileChunkCache {
  private readonly cache = new Map<string, DisplayObject>();

  private buildChunk(
    layer: TileLayer,
    chunkX: number,
    chunkY: number,
    textures: any[],
    tmx: any,
    chunkSizeTiles: number
  ): CompositeTilemap {
    const tileSets = getProperty(layer, 'usedTileSets');
    const tilemap = new CompositeTilemap(tileSets);
    const startX = chunkX * chunkSizeTiles;
    const startY = chunkY * chunkSizeTiles;
    const endX = Math.min(startX + chunkSizeTiles, tmx.width);
    const endY = Math.min(startY + chunkSizeTiles, tmx.height);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = y * tmx.width + x;
        if (layer.data[index] > 0) {
          tilemap.tile(
            textures[layer.data[index]],
            x * TILE_SIZE,
            y * TILE_SIZE
          );
        }
      }
    }

    return tilemap;
  }

  getOrBuildChunk(
    layerIndex: number,
    chunkX: number,
    chunkY: number,
    layer: TileLayer,
    textures: any[],
    tmx: any,
    chunkSizeTiles: number
  ): DisplayObject {
    const key = buildChunkKey(layerIndex, chunkX, chunkY);
    const cached = this.cache.get(key);

    if (cached) {
      return cached;
    }

    const displayObject = this.buildChunk(
      layer,
      chunkX,
      chunkY,
      textures,
      tmx,
      chunkSizeTiles
    );

    displayObject.name = key;
    this.cache.set(key, displayObject);
    return displayObject;
  }

  getVisibleTilemaps(
    layers: TileLayer[],
    bounds: Rectangle,
    textures: any[],
    tmx: any,
    chunkSizeTiles: number
  ): TileLayerChunk[] {
    const { minX, minY, maxX, maxY } = getChunkRange(bounds, chunkSizeTiles);
    const tilemaps: TileLayerChunk[] = [];

    layers.forEach((layer, layerIndex) => {
      for (let chunkY = minY; chunkY <= maxY; chunkY++) {
        for (let chunkX = minX; chunkX <= maxX; chunkX++) {
          tilemaps.push({
            layerIndex,
            displayObject: this.getOrBuildChunk(
              layerIndex,
              chunkX,
              chunkY,
              layer,
              textures,
              tmx,
              chunkSizeTiles
            )
          });
        }
      }
    });

    return tilemaps;
  }

  evictOutside(
    bounds: Rectangle,
    layerCount: number,
    chunkSizeTiles: number,
    marginChunks = 1
  ): void {
    const { minX, minY, maxX, maxY } = getChunkRange(bounds, chunkSizeTiles);
    const keepKeys = new Set<string>();

    for (
      let chunkY = minY - marginChunks;
      chunkY <= maxY + marginChunks;
      chunkY++
    ) {
      for (
        let chunkX = minX - marginChunks;
        chunkX <= maxX + marginChunks;
        chunkX++
      ) {
        if (chunkX < 0 || chunkY < 0) continue;

        for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
          keepKeys.add(buildChunkKey(layerIndex, chunkX, chunkY));
        }
      }
    }

    for (const [key, displayObject] of this.cache.entries()) {
      if (!keepKeys.has(key)) {
        displayObject.filters = null;
        displayObject.parentGroup = null;
        if (displayObject.parent) {
          displayObject.parent.removeChild(displayObject);
        }
        displayObject.destroy({ children: true });
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    for (const displayObject of this.cache.values()) {
      displayObject.filters = null;
      displayObject.parentGroup = null;
      if (displayObject.parent) {
        displayObject.parent.removeChild(displayObject);
      }
      displayObject.destroy({ children: true });
    }
    this.cache.clear();
  }
}
