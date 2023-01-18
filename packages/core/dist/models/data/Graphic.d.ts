/**
 * Graphic Model
 * @property {number} id
 * @property {Array.<Graphic|number>} frames
 * @property {Array.<PIXI.Texture>} textures
 * @property {string} fileName
 * @property {string} path
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} speed
 * @property {PIXI.Rectangle} region
 * @exports Graphic
 */
export default class Graphic {
    constructor({ id, frames, textures, fileName, path, x, y, width, height, speed, }?: {
        id?: number;
        frames?: any[];
        textures?: any[];
        fileName?: string;
        path?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        speed?: number;
    });
    id: number;
    frames: any[];
    textures: any[];
    fileName: string;
    path: string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    region: Rectangle;
}
/**
 * TexturedGraphic Model
 * @property {Texture} texture
 * @extends Graphic
 */
export class TexturedGraphic extends Graphic {
    constructor(options?: {});
    set texture(arg: any);
    get texture(): any;
    get isLoaded(): boolean;
    _texture: any;
}
import { Rectangle } from ".pnpm/@pixi+math@6.5.8/node_modules/@pixi/math";
//# sourceMappingURL=Graphic.d.ts.map