import { AnimatedSprite, Sprite, Point, Rectangle } from 'pixi.js';
import { TmxObject } from '@bao/core';

export type SpritesCache = { [key: string]: Sprite | AnimatedSprite };

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
