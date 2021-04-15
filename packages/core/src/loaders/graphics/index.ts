import _ from 'lodash';
import { Rectangle, SCALE_MODES, Texture, utils } from 'pixi.js';

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
import { TILE_SIZE } from '@mob/core/src/constants/game/Map';
import { getGraphicsFileName } from '@mob/core/loaders/util';

/**
 * Determines if a graphic is an animation
 * @param graphic
 * @returns {boolean}
 */
export const isAnimation = graphic => _.get(graphic, 'frames.length', 0) > 1;

/**
 * Translates spritesheet frame to graphic uv coordinates
 * @param graphic
 * @param frame
 * @returns {PIXI.Rectangle}
 */
export const getRegion = (graphic, frame) => {
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
 * @param graphic
 * @returns {null|PIXI.Texture}
 */
export const getTexture = (graphic) => {
  if (!graphic || !graphic.fileName) return null;
  const fileName = getGraphicsFileName(graphic.fileName);
  const frame = Texture.fromImage(fileName);
  const texture = new Texture(frame.baseTexture, getRegion(graphic, frame.frame));
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  texture.baseTexture.mipmap = true;
  return texture;
};

/**
 * Obtains dimensions for a `graphic` object, returns
 * width, height, offsetX and offsetY
 * @param graphic
 * @returns {{ width, height, offsetX, offsetY }}
 */
export const getDimensions = (graphic) => {
  const fileName = _.get(graphic, 'fileName');
  const texture = Texture.fromImage(getGraphicsFileName(fileName));
  const width = texture.width <= graphic.width ? texture.width : graphic.width;
  const height = texture.height <= graphic.height ? texture.height : graphic.height;
  const offsetX = (width - TILE_SIZE) / 2;
  const offsetY = height - TILE_SIZE;
  return { width, height, offsetX, offsetY };
};

/**
 * Create array of textures for each frame in `Graphic` instance
 * @param animation
 * @returns {Graphic}
 */
export const parseAnimation = (animation) => {
  const getTextures = flow(reject(isUndefined), map(getTexture));
  animation.textures = getTextures(animation.frames);

  return animation;
};

/**
 * Filter animations from graphics list
 * @param graphics
 * @return {Array.<Graphic>}
 */
export const getAnimations = (graphics) => {
  const animations = flow(
    filter(isAnimation),
    map(parseAnimation)
  );

  return animations(values(graphics));
};

/**
 * Flattens an animations array into an array of all it's
 * `Graphic` frames
 * @param graphics
 * @return {function(*):Array.<Graphic>}
 */
export const getAnimationFrames = (
  flatMap(animation => animation.frames.map(g => g))
);

/**
 * Gets all graphics that are not referenced in any animation
 * @param graphics
 * @param diff `diff=false` returns animations
 * @returns {Array.<Graphic>}
 */
export const getStaticGraphics = (graphics, diff = true) => {
  const animations = getAnimations(graphics);
  const frames = getAnimationFrames(animations);
  const staticGraphics = difference(values(graphics));
  return diff ? staticGraphics(frames) : frames;
};

/**
 * Gets all animated graphics
 * @param graphics
 * @param diff
 * @returns {Array.<Graphic>}
 */
export const getAnimatedGraphics = (graphics, diff = false) => (
  getStaticGraphics(graphics, diff)
);


/**
 * Returns an array of file paths extracted from a graphics
 * data object
 * @param graphics
 * @param unique
 * @param flatPaths
 * @returns {Array.<Graphic|string>}
 */
export const getFileNames = (graphics, unique = true, flatPaths = true) => {
  const fileNames = flow(
    reject(isUndefined),
    reject(isAnimation),
    unique ? uniqBy(property('fileName')) : tap(),
    flatPaths ? map(graphic => graphic.path) : tap(),
  );

  return fileNames(graphics.length > 0 ? graphics : values(graphics));
};
