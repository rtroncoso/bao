import each from 'lodash/fp/each';
import flatMap from 'lodash/fp/flatMap';
import flow from 'lodash/fp/flow';
import keys from 'lodash/fp/keys';
import range from 'lodash/fp/range';

import {
  ANIMATION_SPRITESHEETS,
  ATLAS_COLUMNS,
  NORMAL_SPRITESHEETS,
  TILESET_SPRITESHEETS
} from '@bao/core/constants/game/Graphics';
import { TILE_SIZE } from '@bao/core/constants/game/Map';
import { getGraphicsFileName } from '@bao/core/loaders/util';
import { Rectangle, Texture, SCALE_MODES } from 'pixi.js';

/** Frames memoization */
const framesCache = {};

/**
 * Converts sprite sheet index to absolute sprite sheet path with extension
 * @param index
 * @param path
 * @param basePath
 * @param extension
 * @returns {string}
 */
export const getSpriteSheetPath =
  (index = 0, type = '', basePath = '', extension = '') => (
    `${basePath ? `${basePath}/` : ''}${type}-${index}${extension}`
  );

/**
 * Converts sprite sheet index to absolute sprite sheet tile set path
 * @param index
 * @param path
 * @param basePath
 * @returns {string}
 */
export const getTileSetFilePath = (index = 0, type = '', basePath = '') => (
  getSpriteSheetPath(index, type, basePath, '.tsx')
);

/**
 * Converts sprite sheet index to absolute sprite sheet image path
 * @param index
 * @param path
 * @param basePath
 * @returns {string}
 */
export const getSpriteSheetFilePath = (index = 0, type = '', basePath = '') => (
  getSpriteSheetPath(index, type, basePath, '.json')
);

/**
 * Converts sprite sheet index to absolute sprite sheet path
 * @param index
 * @param path
 * @param basePath
 * @returns {string}
 */
export const getSpriteSheetImagePath = (index = 0, type = '', basePath = '') => (
  getSpriteSheetPath(index, type, basePath, '.png')
);

/**
 * Generates a spriteSheet list using generator functions above
 * @param amount
 * @param type
 * @param processFn
 * @param basePath
 * @returns {Array.<string>}
 */
export const spriteSheetGenerator = (amount, type, basePath, processFn) => (
  range(0, amount).flatMap(i => ([processFn(i + 1, type, basePath)]))
);

/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @param basePath
 * @returns {Array.<string>}
 */
export const getTileSetFilePaths =
  (amount = TILESET_SPRITESHEETS, basePath) => (
    spriteSheetGenerator(amount, 'tilesets', basePath, getSpriteSheetFilePath)
  );

/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @param basePath
 * @returns {Array.<string>}
 */
export const getTileSetNormalFilePaths =
  (amount = NORMAL_SPRITESHEETS, basePath) => spriteSheetGenerator(
    amount, 'tilesets-normal', basePath, getSpriteSheetFilePath
  );

/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @param basePath
 * @returns {Array.<string>}
 */
export const getTileSetImagePaths =
  (amount = TILESET_SPRITESHEETS, basePath) => spriteSheetGenerator(amount, 'tilesets', basePath, getSpriteSheetImagePath);

/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @param basePath
 * @returns {Array.<string>}
 */
export const getAnimationFilePaths =
  (amount = ANIMATION_SPRITESHEETS, basePath) => spriteSheetGenerator(amount, 'animations', basePath, getSpriteSheetFilePath);

/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @param basePath
 * @returns {Array.<string>}
 */
export const getAnimationImagePaths =
  (amount = ANIMATION_SPRITESHEETS, basePath) => spriteSheetGenerator(amount, 'animations', basePath, getSpriteSheetImagePath);

/**
 * Finds a graphic frame using `spriteSheet` frames data
 * @param graphic
 * @param spriteSheet
 * @param tileSet
 * @returns {{ frame: any, spriteSheet: any, tileSet: any }|null}
 */
export const findInSpriteSheet = ({ graphic, spriteSheet = {}, tileSet = {} }) => {
  const { frames } = (spriteSheet as any).data;
  const key = getGraphicsFileName(graphic.fileName);
  const memoKey = `${key}:${graphic.id}`;

  if (framesCache[memoKey]) {
    return framesCache[memoKey];
  }

  if (Object.keys(frames).indexOf(key) > -1) {
    const frame = { ...frames[key].frame };
    frame.graphic = graphic;
    frame.x += graphic.x;
    frame.y += graphic.y;
    frame.w = graphic.width;
    frame.h = graphic.height;

    const data = { frame, spriteSheet, tileSet };
    framesCache[memoKey] = data;
    return data;
  }

  return null;
};

/**
 * Makes a flattened list of all texture atlas internal textures from resources
 * @param resources
 * @param graphics
 * @param type
 * @param amount
 * @param preserveSize
 * @returns {Array.<Texture>}
 */
export const getAllTextures =
  (resources, type, basePath, amount, preserveSize = true): Texture[] => {
    const data = spriteSheetGenerator(amount, type, basePath, getSpriteSheetFilePath);
    const getFrameData = s => resources[s] && {
      spritesheet: resources[s],
      frames: resources[s].data.frames,
      textures: resources[s].textures
    };

    let gid = 0;
    const textures = [];
    const processSpriteSheet = (spriteSheet) => {
      const frame = getFrameData(spriteSheet);
      const { frames } = frame;
      const firstgid = gid * ATLAS_COLUMNS * ATLAS_COLUMNS + 1;
      gid++;

      for (const key of keys(frames)) {
        const frameData = frames[key].frame;
        const base = frame.textures[key];
        base.baseTexture.scaleMode = SCALE_MODES.NEAREST;
        for (let j = 0; j < frameData.h; j += TILE_SIZE) {
          for (let i = 0; i < frameData.w; i += TILE_SIZE) {
            const index = ((frameData.y + j) / TILE_SIZE) * ATLAS_COLUMNS + (frameData.x + i) / TILE_SIZE;
            const region = {
              x: frameData.x + i,
              y: frameData.y + j,
              width: preserveSize ? frameData.width : TILE_SIZE,
              height: preserveSize ? frameData.height : TILE_SIZE
            };

            const rect = new Rectangle(region.x, region.y, region.width, region.height);
            const texture = new Texture(base.baseTexture, rect);
            textures[firstgid + index] = texture;
          }
        }
      }
    };

    const getTextures = each(processSpriteSheet);
    getTextures(data);
    return textures;
  };

/**
 * Finds all textures for all frames in `tileset` types
 * @param resources
 * @param graphics
 * @param type
 * @param basePath
 * @param amount
 * @param preserveSize
 */
export const getTileSetTextures = (
  resources,
  type = 'tilesets',
  basePath = '',
  amount = TILESET_SPRITESHEETS,
  preserveSize = false,
) => getAllTextures(resources, type, basePath, amount, preserveSize);

/**
 * Finds all textures for all frames in `tileset` types
 * @param resources
 * @param graphics
 * @param type
 * @param basePath
 * @param amount
 * @param preserveSize
 */
export const getSpriteSheetTextures = (
  resources,
  type = 'tilesets',
  basePath = '',
  amount = TILESET_SPRITESHEETS,
  preserveSize = false,
) => getAllTextures(resources, type, basePath, amount, preserveSize);

/**
 * Finds all textures for all frames in `animation` types
 * @param resources
 * @param graphics
 * @param type
 * @param basePath
 * @param amount
 */
export const getAnimationTextures = (
  resources,
  type = 'animations',
  basePath = '',
  amount = ANIMATION_SPRITESHEETS
) => getAllTextures(resources, type, basePath, amount);

/**
 * Makes a flattened list of all texture atlas textures from resources
 * @param resources
 * @param spriteSheets
 * @param type
 * @param basePath
 * @param amount
 */
export const getTextureAtlasTextures =
  (resources, spriteSheets, type = 'tilesets', basePath = '', amount = TILESET_SPRITESHEETS) => {
    const key = s => `${s}_image`;
    const data = spriteSheets || spriteSheetGenerator(amount, type, basePath, getSpriteSheetFilePath);
    const getTextures = flow(
      flatMap(s => resources[key(s)] && resources[key(s)].texture),
    );

    return getTextures(data);
  };
