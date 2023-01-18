import { JsonGraphicState } from '@mob/core/loaders/graphics';
import { Graphic, MapObject, Tile } from '@mob/core/models';
export interface JsonTile {
    [key: string]: any;
}
export interface ParseJsonTileWrapperParameters {
    animations: Graphic[];
    graphics: JsonGraphicState;
    objects: MapObject[];
}
export interface ParseJsonTileParameters<InputType> {
    data: InputType;
    layer: number;
    x: number;
    y: number;
}
export type ParseJsonTile<K, O> = (params: ParseJsonTileParameters<K>) => O;
export type ParseJsonTileWrapper<K, O> = (params: ParseJsonTileWrapperParameters) => (ParseJsonTile<K, O>);
/**
 * Parses `Tile` model from `data` object
 */
export declare const parseJsonTile: ParseJsonTileWrapper<JsonTile, Tile>;
export interface MapLayersParameters {
    rows: JsonTile[][];
    process: ParseJsonTile<JsonTile, Tile>;
}
/**
 * Maps layers from JSON format and creates `Tile` model
 * structures
 */
export declare const mapLayers: ({ rows, process }: {
    rows: any;
    process: any;
}) => any;
/**
 * Parses JSON formatted `Map` structure from file
 */
export declare const getJsonLayers: ({ animations, graphics, mapFile, objects, }: {
    animations: any;
    graphics: any;
    mapFile: any;
    objects: any;
}) => any;
/**
 * Flattens JSON formatted `Map` structure from `getMapLayers`
 */
export declare const getFlattenedJsonTiles: ({ animations, graphics, mapFile, objects, }: {
    animations: any;
    graphics: any;
    mapFile: any;
    objects: any;
}) => any[];
//# sourceMappingURL=json.d.ts.map