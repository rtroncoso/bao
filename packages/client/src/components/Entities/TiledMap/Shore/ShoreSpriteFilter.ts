import { Filter } from 'pixi.js';
import { TILE_SIZE } from '@bao/core';

import vertex from './shoreSprite.vert';
import fragment from './shoreSprite.frag';
import { shoreBitmaskToUniform } from './shoreUtils';
import {
  getFilterTimeScale,
  getGlobalAnimationTime
} from './effectAnimationRegistry';

/** UV band on E/W shores (keeps the wider foam strip that already reads well). */
const EDGE_BAND_HORIZONTAL = 0.45;

/** North shores: foam is a thin strip at the top — keep the band tight. */
const EDGE_BAND_VERTICAL_NORTH = 0.08;

/** South shores: thicker foam band — current look reads well. */
const EDGE_BAND_VERTICAL_SOUTH = 0.16;

const WAVE_AMP_PX = 1.5;
const WAVE_AMP_VERTICAL_PX = 1.1;
const WAVE_SPEED = 2.0;

/** Per-tick time advance for shore filters (water uses the default). */
export const SHORE_FILTER_TIME_SCALE = 0.038;

export class ShoreSpriteFilter extends Filter {
  constructor(edgeMask: number) {
    super(vertex, fragment);

    this.uniforms.time = 0;
    this.uniforms.waveSpeed = WAVE_SPEED;
    this.uniforms.waveAmpPx = WAVE_AMP_PX;
    this.uniforms.waveAmpVerticalPx = WAVE_AMP_VERTICAL_PX;
    this.uniforms.edgeBandHorizontal = EDGE_BAND_HORIZONTAL;
    this.uniforms.edgeBandVerticalNorth = EDGE_BAND_VERTICAL_NORTH;
    this.uniforms.edgeBandVerticalSouth = EDGE_BAND_VERTICAL_SOUTH;
    this.uniforms.waterEdges = shoreBitmaskToUniform(edgeMask);
    this.uniforms.worldOrigin = [0, 0];
    this.uniforms.contentSizePx = [TILE_SIZE, TILE_SIZE];
    this.uniforms.tileSizePx = [TILE_SIZE, TILE_SIZE];
    this.uniforms.filterPadding = 0;

    this.autoFit = true;
    this.padding = 2;
    this.resolution = 1;
  }

  syncBounds(originX: number, originY: number, width: number, height: number): void {
    this.uniforms.worldOrigin = [originX, originY];
    this.uniforms.contentSizePx = [width, height];
    this.uniforms.filterPadding = this.padding;
  }

  apply(filterManager, input, output, clear): void {
    this.uniforms.time = getGlobalAnimationTime() * getFilterTimeScale(this);
    this.uniforms.filterPadding = this.padding;
    filterManager.applyFilter(this, input, output, clear);
  }
}
