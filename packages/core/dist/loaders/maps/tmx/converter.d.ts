import { LoaderResource } from 'pixi.js';
import { GroupLayer, Tiled, TileSet, TileLayer, TmxObject, ImageLayer, Tile, Graphic } from '@mob/core/models';
/**
 * Fills an area of the map with the tiles that conform an object
 * of dimensions that are greater than TILE_SIZE
 */
export declare const makeTileLayerFromSprite: ({ frame, tile, tilesData, tileSet }: {
    frame: any;
    tile: any;
    tilesData: any;
    tileSet: any;
}) => true | {
    offset: {
        x: any;
        y: any;
    };
    layer: any[][];
    y: any;
};
/**
 * Makes an Image Layer from a given frame and tile data
 */
export declare const makeImageLayer: ({ frame, tile, tileSet, visible }: {
    frame: any;
    tile: any;
    tileSet: any;
    visible?: boolean;
}) => ImageLayer;
export interface MakeRectParameters {
    data?: any;
    graphic?: Graphic;
    meta?: {
        [key: string]: any;
    };
    name?: string | number;
    tile?: Tile;
    type?: string;
}
/**
 * Constructs an object in TMX format
 */
export declare const makeRect: ({ data, graphic, meta, name, tile, type, }: MakeRectParameters) => TmxObject;
export declare const makeAnimation: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeWater: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeCollision: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeTileExit: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeTrigger: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeObject: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeNpc: ({ type, ...props }: MakeRectParameters) => TmxObject;
export declare const makeSprite: ({ type, ...props }: MakeRectParameters) => TmxObject;
export interface MakeShapeParameters {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    type?: string;
    polygon?: Array<{
        x: number;
        y: number;
    }>;
}
/**
 * Makes a collision HitBox object from rect parameters
 */
export declare const makeShape: ({ x, y, width, height, type, polygon }: MakeShapeParameters) => TmxObject;
export interface CropLayerParameters {
    layer: Tile[][];
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/**
 * Crops a map layer using x1, y1, x2, y2
 */
export declare const cropLayer: ({ layer, x1, x2, y1, y2 }: CropLayerParameters) => any;
export interface MakePolygonLayerParameters {
    layers?: TileLayer[];
    layerName?: string;
    objectLayerName?: string;
    layerNumber?: number;
    process?: (tile?: Tile) => TmxObject | void;
    postProcess?: (objects?: TmxObject[], shapes?: TmxObject[]) => TmxObject[];
    optimizer?: (list?: TmxObject[]) => TmxObject[];
}
/**
 * Traverses all tiles from a map and creates a polygon layer
 * using optimizer and process functions
 */
export declare const makePolygonLayer: ({ layerName, layerNumber, layers, objectLayerName, optimizer, postProcess, process, }: MakePolygonLayerParameters) => GroupLayer;
/**
 * Makes a tile exit layer rectangle shapes
 */
export declare const makeTileExitsLayer: ({ layers }: {
    layers: any;
}) => GroupLayer;
/**
 * Makes a collision layer rectangle shapes
 */
export declare const makeCollisionLayer: ({ layers }: {
    layers: any;
}) => GroupLayer;
/**
 * Makes a water layer rectangle shapes
 */
export declare const makeWaterLayer: ({ layers }: {
    layers: any;
}) => GroupLayer;
/**
 * Makes trigger layers polygon shapes
 */
export declare const makeTriggersLayer: ({ layers }: {
    layers: any;
}) => any;
/**
 * Makes an npc layer objects data
 */
export declare const makeNpcsLayer: ({ layers }: {
    layers: any;
}) => GroupLayer;
/**
 * Makes an objects layer data
 */
export declare const makeObjectsLayer: ({ layers }: {
    layers: any;
}) => GroupLayer;
export interface ProcessLayerParameters {
    offset?: {
        x: number;
        y: number;
    };
    resources: {
        [key: string]: LoaderResource;
    };
    tileSets: TileSet[];
    tmx: Tiled;
}
/**
 * Handles layer parsing
 */
export declare const processLayer: ({ offset, resources, tileSets, tmx, }: ProcessLayerParameters) => (layer: Tile[][], index: number) => GroupLayer;
export interface ConvertLayersToTmxParameters {
    crop: boolean;
    layers: Tile[][][];
    name: string;
    number: number;
    resources: {
        [key: string]: LoaderResource;
    };
}
/**
 * Convert Map Layers from JSON format to TMX
 */
export declare const convertLayersToTmx: ({ crop, layers, name, number, resources, }: ConvertLayersToTmxParameters) => Tiled;
//# sourceMappingURL=converter.d.ts.map