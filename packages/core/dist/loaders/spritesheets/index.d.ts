export function getSpriteSheetPath(index?: number, path?: string, extension?: string): string;
export function getTileSetFilePath(index?: number, path?: string): string;
export function getSpriteSheetFilePath(index?: number, path?: string): string;
export function getSpriteSheetImagePath(index?: number, path?: string): string;
export function spriteSheetGenerator(amount: any, type: any, processFn: any): Array<string>;
export function getTileSetFilePaths(amount?: any): Array<string>;
export function getTileSetNormalFilePaths(amount?: any): Array<string>;
export function getTileSetImagePaths(amount?: any): Array<string>;
export function getAnimationFilePaths(amount?: any): Array<string>;
export function getAnimationImagePaths(amount?: any): Array<string>;
export function findInSpriteSheet({ graphic, spriteSheet, resources, tileSet }: {
    graphic: any;
    spriteSheet?: {};
    resources?: {};
    tileSet?: {};
}): {
    frame: any;
    spriteSheet: any;
    tileSet: any;
} | null;
export function getAllTextures(resources: any, graphics: any, type: any, amount: any, preserveSize?: boolean): Array<Texture>;
export function getTileSetTextures(resources: any, graphics: any, type?: any, amount?: any, preserveSize?: boolean): Texture<import("pixi.js").Resource>[];
export function getSpriteSheetTextures(resources: any, graphics: any, type?: any, amount?: any, preserveSize?: boolean): Texture<import("pixi.js").Resource>[];
export function getAnimationTextures(resources: any, graphics: any, type?: any, amount?: any): Texture<import("pixi.js").Resource>[];
export function getTextureAtlasTextures(resources: any, spriteSheets: any, type?: any, amount?: any): any;
import { Texture } from ".pnpm/@pixi+core@6.5.8_plvhmba5imzl5ocyxvgulib4y4/node_modules/@pixi/core";
//# sourceMappingURL=index.d.ts.map