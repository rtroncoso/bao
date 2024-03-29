import _ from 'lodash';
import { MIPMAP_MODES, Rectangle, SCALE_MODES, Texture } from 'pixi.js';

import difference from 'lodash/fp/difference';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import flatMap from 'lodash/fp/flatMap';
import isUndefined from 'lodash/fp/isUndefined';
import map from 'lodash/fp/map';
import property from 'lodash/fp/property';
import reject from 'lodash/fp/reject';
import tap from 'lodash/fp/tap';
import uniqBy from 'lodash/fp/uniqBy';
import values from 'lodash/fp/values';

import { TILE_SIZE } from '@bao/core/constants/game/Map';
import { Graphic } from '@bao/core/models';
import { getGraphicsFileName } from '@bao/core/loaders/util';

export interface RegionFrame {
  x: number;
  y: number;
}

/**
 * Determines if a graphic is an animation
 */
export const isAnimation = (graphic: Graphic) => _.get(graphic, 'frames.length', 0) > 1;

/**
 * Translates spritesheet frame to graphic uv coordinates
 */
export const getRegion = (graphic: Graphic, frame: RegionFrame) => {
  const region = new Rectangle();
  region.x = frame.x + graphic.x;
  region.y = frame.y + graphic.y;
  region.width = graphic.width;
  region.height = graphic.height;
  return region;
};

/**
 * Obtains spritesheet texture from graphic with corrected region,
 * scale mode and mipmaps setting
 */
export const getTexture = (graphic: Graphic | number) => {
  if (graphic instanceof Graphic) {
    if (!graphic || !graphic.fileName) return null;
    const fileName = getGraphicsFileName(graphic.fileName);
    const frame = Texture.from(fileName);
    const texture = new Texture(frame.baseTexture, getRegion(graphic, frame.frame));
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
    return texture;
  }

  console.warn(`[graphics:getTexture] waspassed a non-graphic reference`);
  return Texture.EMPTY;
};

/**
 * Obtains dimensions for a `graphic` object, returns
 * width, height, offsetX and offsetY
 */
export const getDimensions = (graphic: Graphic) => {
  const fileName = _.get(graphic, 'fileName');
  const texture = Texture.from(getGraphicsFileName(fileName));
  const width = texture.width <= graphic.width ? texture.width : graphic.width;
  const height = texture.height <= graphic.height ? texture.height : graphic.height;
  const offsetX = (width - TILE_SIZE) / 2;
  const offsetY = height - TILE_SIZE;
  return { width, height, offsetX, offsetY };
};

/**
 * Create array of textures for each frame in `Graphic` instance
 */
export const parseAnimation = (animation: Graphic) => {
  // const getTextures = flow(reject(isUndefined), map(getTexture));
  // animation.textures = getTextures(animation.frames);

  return animation;
};

/**
 * Filter animations from graphics list
 */
export const getAnimations = (graphics: Graphic[]): Graphic[] => {
  const animations = flow(
    filter(isAnimation),
    map(parseAnimation)
  );

  return animations(values(graphics));
};

/**
 * Flattens an animations array into an array of all it's
 * `Graphic` frames
 */
export const getAnimationFrames = (
  flatMap((animation: Graphic) => animation.frames as Graphic[])
);

export interface GetStaticGraphicsParameters {
  diff: boolean;
  graphics: Graphic[];
}

/**
 * Gets all graphics that are not referenced in any animation
 */
export const getStaticGraphics = ({
  graphics,
  diff
}: GetStaticGraphicsParameters) => {
  const animations = getAnimations(graphics);
  const frames = getAnimationFrames(animations);
  const staticGraphics = difference(values(graphics));
  return diff ? staticGraphics(frames) : frames;
};

export interface GetAnimatedGraphicsParameters {
  graphics: Graphic[];
}

/**
 * Gets all animated graphics
 */
export const getAnimatedGraphics = ({
  graphics
}: GetAnimatedGraphicsParameters) => (
  getStaticGraphics({ graphics, diff: false })
);


/**
 * Returns an array of file paths extracted from a graphics
 */
export const getFileNames = (graphics: Graphic[], unique = true, flatPaths = true) => {
  const fileNames = flow(
    reject(isUndefined),
    reject(isAnimation),
    unique ? uniqBy(property('fileName')) : tap,
    flatPaths ? map((graphic: Graphic) => graphic.path) : tap,
  );

  return fileNames(graphics.length > 0 ? graphics : values(graphics));
};
