import { AnimatedSprite, Sprite } from 'pixi.js';
import { TmxObject } from '@bao/core';

import { SpatialHashGrid } from './spatial';

export type SpritesCache = { [key: string]: Sprite | AnimatedSprite };

export type ObjectsInViewport = { [layer: string]: string[] };

export interface SpatialIndexes {
  sprites: SpatialHashGrid<TmxObject>;
  objects: SpatialHashGrid<TmxObject>;
}

export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledMapData {
  objects: TmxObject[];
  sprites: TmxObject[];
  tileLayers: any[];
  triggers: TmxObject[];
  tmx: any;
  collisions: any[];
  objectLayers: any[];
  water: any[];
}

export interface RenderTarget {
  current: any;
}

export interface SpritePoolConfig {
  animationsPoolSize: number;
  spritesPoolSize: number;
}

export interface TriggerHandlingConfig {
  tolerance: number;
  boxPolygonTolerance: number;
  fadeAnimationDuration: number;
}
