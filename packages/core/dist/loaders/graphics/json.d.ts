import { Graphic } from '@mob/core/models/data/shared';
export interface JsonGraphicModel {
    fileName: string | number;
    height: number;
    id: string | number;
    width: number;
    x: number;
    y: number;
}
export interface AnimatedJsonGraphicModel {
    frames: Array<number>;
    id: string | number;
    speed: number;
}
export type JsonGraphicsModel = Array<number | JsonGraphicModel | AnimatedJsonGraphicModel>;
export interface JsonGraphicState {
    [key: string]: Graphic;
}
/**
 * Create a `Graphic` model instance from props and
 * add it to a reducer object for self-referencing
 * animations
 */
export declare const parseJsonGraphic: (state: JsonGraphicState, data: JsonGraphicModel & AnimatedJsonGraphicModel) => JsonGraphicState;
/**
 * Parses JSON graphics file into a key-value map
 * of graphic id's and their respective `Graphic`
 */
export declare const getJsonGraphics: (data: JsonGraphicsModel) => any;
//# sourceMappingURL=json.d.ts.map