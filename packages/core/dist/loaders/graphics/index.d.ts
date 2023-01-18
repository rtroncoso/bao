export function isAnimation(graphic: any): boolean;
export function getRegion(graphic: any, frame: any): PIXI.Rectangle;
export function getTexture(graphic: any): null | PIXI.Texture;
export function getDimensions(graphic: any): {
    width: any;
    height: any;
    offsetX: any;
    offsetY: any;
};
export function parseAnimation(animation: any): Graphic;
export function getAnimations(graphics: any): Array<Graphic>;
/**
 * Flattens an animations array into an array of all it's
 * `Graphic` frames
 * @param graphics
 * @return {function(*):Array.<Graphic>}
 */
export const getAnimationFrames: any;
export function getStaticGraphics(graphics: any, diff?: boolean): Array<Graphic>;
export function getAnimatedGraphics(graphics: any, diff?: boolean): Array<Graphic>;
export function getFileNames(graphics: any, unique?: boolean, flatPaths?: boolean): Array<Graphic | string>;
//# sourceMappingURL=index.d.ts.map