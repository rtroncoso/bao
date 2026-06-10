import { Filter } from 'pixi.js';
import { TILE_SIZE } from '@bao/core';

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

/** Per-tick time advance for shore filters (water uses the default 0.07). */
export const SHORE_FILTER_TIME_SCALE = 0.07;

/** Pixi v6 default filter vertex — filter quad only exposes aVertexPosition. */
const FILTER_VERTEX = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition(void) {
  vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.0)) + outputFrame.xy;
  return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
  return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
}
`;

const SHORE_FRAGMENT = `
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform vec4 inputClamp;

uniform float time;
uniform float waveSpeed;
uniform float waveAmpPx;
uniform float waveAmpVerticalPx;
uniform vec4 waterEdges;
uniform float edgeBandHorizontal;
uniform float edgeBandVerticalNorth;
uniform float edgeBandVerticalSouth;
uniform vec2 worldOrigin;
uniform vec2 contentSizePx;
uniform vec2 tileSizePx;
uniform float shorePadding;

float edgeProximity(float distFromWater, float band) {
  return pow(1.0 - smoothstep(0.0, band, distFromWater), 3.0);
}

vec2 waterEdgeWaveOffset(vec2 uv) {
  vec2 offsetPx = vec2(0.0);
  float phase = time * waveSpeed;
  float waveScale = 0.35;

  vec2 localPx = uv * inputSize.xy - vec2(shorePadding);
  vec2 worldPx = worldOrigin + localPx;
  vec2 tileLocalUv = mod(localPx + vec2(0.001), tileSizePx) / tileSizePx;

  if (waterEdges.x > 0.5) {
    float weight = edgeProximity(tileLocalUv.y, edgeBandVerticalNorth);
    offsetPx.y -= sin(phase + worldPx.x * waveScale) * waveAmpVerticalPx * weight;
  }

  if (waterEdges.z > 0.5) {
    float weight = edgeProximity(1.0 - tileLocalUv.y, edgeBandVerticalSouth);
    offsetPx.y += sin(phase + worldPx.x * waveScale) * waveAmpVerticalPx * weight;
  }

  if (waterEdges.w > 0.5) {
    float weight = edgeProximity(tileLocalUv.x, edgeBandHorizontal);
    offsetPx.x -= sin(phase + worldPx.y * waveScale) * waveAmpPx * weight;
  }

  if (waterEdges.y > 0.5) {
    float weight = edgeProximity(1.0 - tileLocalUv.x, edgeBandHorizontal);
    offsetPx.x += sin(phase + worldPx.y * waveScale) * waveAmpPx * weight;
  }

  return offsetPx / max(inputSize.xy, vec2(1.0));
}

void main(void) {
  vec2 texel = 1.0 / max(inputSize.xy, vec2(1.0));
  vec2 insetMin = inputClamp.xy + texel * 0.5;
  vec2 insetMax = inputClamp.zw - texel * 0.5;
  vec2 uv = clamp(vTextureCoord, insetMin, insetMax);
  vec2 sampleUv = clamp(uv + waterEdgeWaveOffset(uv), insetMin, insetMax);
  gl_FragColor = texture2D(uSampler, sampleUv);
}
`;

export class ShoreSpriteFilter extends Filter {
  constructor(edgeMask: number) {
    super(FILTER_VERTEX, SHORE_FRAGMENT);

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
    this.uniforms.shorePadding = 0;

    this.autoFit = true;
    this.padding = 2;
    this.resolution = 1;
  }

  syncBounds(originX: number, originY: number, width: number, height: number): void {
    this.uniforms.worldOrigin = [originX, originY];
    this.uniforms.contentSizePx = [width, height];
    this.uniforms.shorePadding = this.padding;
  }

  apply(filterManager, input, output, clear): void {
    this.uniforms.time = getGlobalAnimationTime() * getFilterTimeScale(this);
    this.uniforms.shorePadding = this.padding;
    filterManager.applyFilter(this, input, output, clear);
  }
}
