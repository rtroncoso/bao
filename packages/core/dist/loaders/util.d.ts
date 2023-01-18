import { Graphic } from '@mob/core/models/data/shared';
import { JsonGraphicState } from './graphics';
/**
 * Adds extension to fileName
 */
export declare const getGraphicsFileName: (fileName: string | number) => string;
/**
 * Converts file name to absolute texture path
 */
export declare const getGraphicsFilePath: (fileName: string | number) => string;
/**
 * Extrapolates from INI data `key` formatted using `keyFormat`
 */
export declare const parseKey: (key?: string, keyFormat?: RegExp) => string;
export interface FindAnimationParameters {
    animations: Graphic[];
    id: string | number;
}
/**
 * Finds an animation by `id` property in an animations array
 */
export declare const findAnimation: ({ animations, id }: FindAnimationParameters) => any;
export interface FindGraphicParameters {
    graphics: JsonGraphicState;
    id: string | number;
}
/**
 * Finds a graphic by `id` property in a graphics object
 */
export declare const findGraphic: ({ graphics, id }: FindGraphicParameters) => Graphic;
export interface FindGraphicsByFileNameParameters {
    fileName: string | number;
    graphics: JsonGraphicState;
}
/**
 * Finds a graphic by `fileName` property in a graphics object
 */
export declare const findGraphicsByFileName: ({ fileName, graphics }: FindGraphicsByFileNameParameters) => any;
/** Default animation parsing order */
export declare const defaultOrder: string[];
export interface ParseDirectionGraphicWrapper {
    graphics: JsonGraphicState;
    Model: any;
    order?: string[];
}
export interface DirectionGraphicData {
    id: string | number;
    up: string | number;
    left: string | number;
    down: string | number;
    right: string | number;
}
/**
 * Given a map of `graphics` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `graphics` map. Provides a generator function
 * for use with the {@link reduce} method
 */
export declare const parseDirectionGraphicByModel: <D extends DirectionGraphicData, S>({ graphics, Model, order }: ParseDirectionGraphicWrapper) => (state: S, data: D) => S;
export interface ParseDirectionAnimationWrapper {
    animations: Graphic[];
    Model: any;
    order?: string[];
}
export interface DirectionAnimationData {
    id: string | number;
    up: string | number;
    left: string | number;
    down: string | number;
    right: string | number;
}
/**
 * Given an array of `animations` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `animations` array. Provides a generator
 * function for use with the {@link reduce} method
 */
export declare const parseDirectionAnimationByModel: <D extends DirectionAnimationData, S>({ animations, Model, order }: ParseDirectionAnimationWrapper) => (state: S, data: D) => S;
//# sourceMappingURL=util.d.ts.map