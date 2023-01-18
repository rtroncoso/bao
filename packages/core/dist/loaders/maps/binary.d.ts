import { JsonGraphicState } from '@mob/core/loaders/graphics';
import { Graphic, LayeredTile, MapObject } from '@mob/core/models';
import { BufferAdapter } from '@mob/core/util';
/**
 * Parses basic & inf tile data from buffers
 */
export declare const parseBinaryTile: (mapBuffer: BufferAdapter, infBuffer: BufferAdapter) => (x: number, y: number) => LayeredTile;
/**
 * Iterates over a virtual map's tiles in -y --> +y / -x --> +x
 */
export declare const iterate: (action?: (x: number, y: number) => any) => any;
/**
 * Reads and processes tile layers from a buffer
 */
export declare const mapBinaryLayers: (process: (x: number, y: number) => LayeredTile) => LayeredTile[][];
/**
 * Translates tile exits in x direction by `amount`
 */
export declare const translateTileExits: (tiles: LayeredTile[][], amount?: number) => (x: number, y: number) => LayeredTile;
export interface GetBinaryTilesParameters {
    animations: Graphic[];
    datFile: string;
    graphics: JsonGraphicState;
    infFile: Uint8Array;
    mapFile: Uint8Array;
    translateExits?: boolean;
}
/**
 * Parses binary formatted `Map` structure from array buffer
 */
export declare const getBinaryTiles: ({ infFile, mapFile, translateExits }: GetBinaryTilesParameters) => LayeredTile[][];
export interface GetBinaryLayersParameters {
    animations: Graphic[];
    datFile: string;
    graphics: JsonGraphicState;
    infFile: Uint8Array;
    mapFile: Uint8Array;
    objects: MapObject[];
    translateExits?: boolean;
}
/**
 * Parses binary formatted `Map` structure from array buffer
 * into a layered format (analog to JSON)
 */
export declare const getBinaryLayers: ({ animations, datFile, graphics, infFile, mapFile, objects, }: GetBinaryLayersParameters) => any;
export interface GetFlattenedTilesParameters {
    animations: Graphic[];
    datFile: string;
    graphics: JsonGraphicState;
    infFile: Uint8Array;
    mapFile: Uint8Array;
}
/**
 * Flattens binary formatted `Map` structure from `getBinaryLayers`
 */
export declare const getFlattenedBinaryTiles: ({ animations, datFile, graphics, infFile, mapFile, }: GetFlattenedTilesParameters) => LayeredTile[];
//# sourceMappingURL=binary.d.ts.map