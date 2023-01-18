/**
 * Converts sprite sheet index to absolute sprite sheet path with extension
 * @param index
 * @param path
 * @param extension
 * @returns {string}
 */
export declare const getSpriteSheetPath: (index?: number, path?: string, extension?: string) => string;
/**
 * Converts sprite sheet index to absolute sprite sheet tile set path
 * @param index
 * @param path
 * @returns {string}
 */
export declare const getTileSetFilePath: (index?: number, path?: string) => string;
/**
 * Converts sprite sheet index to absolute sprite sheet image path
 * @param index
 * @param path
 * @returns {string}
 */
export declare const getSpriteSheetFilePath: (index?: number, path?: string) => string;
/**
 * Converts sprite sheet index to absolute sprite sheet path
 * @param index
 * @param path
 * @returns {string}
 */
export declare const getSpriteSheetImagePath: (index?: number, path?: string) => string;
/**
 * Generates a spriteSheet list using generator functions above
 * @param amount
 * @param type
 * @param processFn
 * @returns {Array.<string>}
 */
export declare const spriteSheetGenerator: (amount: any, type: any, processFn: any) => any;
/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @returns {Array.<string>}
 */
export declare const getTileSetFilePaths: (amount?: number) => any;
/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @returns {Array.<string>}
 */
export declare const getTileSetNormalFilePaths: (amount?: number) => any;
/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @returns {Array.<string>}
 */
export declare const getTileSetImagePaths: (amount?: number) => any;
/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @returns {Array.<string>}
 */
export declare const getAnimationFilePaths: (amount?: number) => any;
/**
 * Generates a list of spriteSheet file paths
 * @param amount
 * @returns {Array.<string>}
 */
export declare const getAnimationImagePaths: (amount?: number) => any;
/**
 * Finds a graphic frame using `spriteSheet` frames data
 * @param graphic
 * @param spriteSheet
 * @param tileSet
 * @returns {{ frame: any, spriteSheet: any, tileSet: any }|null}
 */
export declare const findInSpriteSheet: ({ graphic, spriteSheet, tileSet }: {
    graphic: any;
    spriteSheet?: {};
    tileSet?: {};
}) => any;
/**
 * Makes a flattened list of all texture atlas internal textures from resources
 * @param resources
 * @param graphics
 * @param type
 * @param amount
 * @param preserveSize
 * @returns {Array.<Texture>}
 */
export declare const getAllTextures: (resources: any, graphics: any, type: any, amount: any, preserveSize?: boolean) => any[];
/**
 * Finds all textures for all frames in `tileset` types
 * @param resources
 * @param graphics
 * @param type
 * @param amount
 * @param preserveSize
 */
export declare const getTileSetTextures: (resources: any, graphics: any, type?: any, amount?: number, preserveSize?: boolean) => any[];
/**
 * Finds all textures for all frames in `tileset` types
 * @param resources
 * @param graphics
 * @param type
 * @param amount
 * @param preserveSize
 */
export declare const getSpriteSheetTextures: (resources: any, graphics: any, type?: any, amount?: number, preserveSize?: boolean) => any[];
/**
 * Finds all textures for all frames in `animation` types
 * @param resources
 * @param graphics
 * @param type
 * @param amount
 */
export declare const getAnimationTextures: (resources: any, graphics: any, type?: any, amount?: number) => any[];
/**
 * Makes a flattened list of all texture atlas textures from resources
 * @param resources
 * @param spriteSheets
 * @param type
 * @param amount
 */
export declare const getTextureAtlasTextures: (resources: any, spriteSheets: any, type?: any, amount?: number) => any;
//# sourceMappingURL=index.d.ts.map