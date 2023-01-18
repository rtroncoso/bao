import { TexturedGraphic } from '@mob/core/models';
export interface ParseIniGraphicState {
    [key: string]: TexturedGraphic;
}
/**
 * Parses animation frames by getting `Graphic` model
 * reference from the `reducer`
 */
export declare const parseAnimations: (state: ParseIniGraphicState) => any;
/**
 * Argentum GRH INI Parsing format:
 *
 * @remarks
 * Static GRH:
 *   `{numFrames}-{fileName}-{x}-{y}-{width}-{height}`
 * Animation:
 *   `{numFrames}-{grh1}-{grh2}-{grh3}-...-{grhN}-{speed}`
 */
export declare const parseIniGraphic: (state: ParseIniGraphicState, graphicsString: string, id: string) => ParseIniGraphicState;
/**
 * Parses INI graphics file `file` into a key-value
 * map of graphic id's and their respective `Graphic`
 * models
 */
export declare const getIniGraphics: (file: string, key?: string) => any;
//# sourceMappingURL=ini.d.ts.map