export function makeTileLayerFromSprite({ frame, tile, tilesData, tileSet }: {
    frame: any;
    tile: any;
    tilesData: any;
    tileSet: any;
}): TileLayer | boolean;
export function makeImageLayer({ frame, tile, tileSet, visible }: {
    frame: any;
    tile: any;
    tileSet: any;
    visible?: boolean;
}): ImageLayer;
export function makeRect({ graphic, name, tile, data, type, meta }: {
    graphic: any;
    name?: any;
    tile: any;
    data: any;
    type: any;
    meta?: {};
}): TmxObject;
export function makeAnimation({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeWater({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeCollision({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeTileExit({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeTrigger({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeObject({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeNpc({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeSprite({ type, ...props }: {
    [x: string]: any;
    type?: any;
}): TmxObject;
export function makeShape({ x, y, width, height, type, ...extra }: {
    [x: string]: any;
    x: any;
    y: any;
    width: any;
    height: any;
    type?: any;
}): TmxObject;
export function cropLayer(layer: any, x1: any, y1: any, x2: any, y2: any): Array<Tile>;
export function makePolygonLayer({ layers, layerName, objectLayerName, layerNumber, process, postProcess, optimizer, }: {
    layers: any;
    layerName: any;
    objectLayerName: any;
    layerNumber?: any;
    process?: () => void;
    postProcess?: any;
    optimizer?: (i: any) => any;
}): GroupLayer;
export function makeTileExitsLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function makeCollisionLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function makeWaterLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function makeTriggersLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function makeNpcsLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function makeObjectsLayer({ layers }: {
    layers: any;
}): GroupLayer;
export function processLayer({ resources, tileSets, offset, }: {
    resources?: {};
    tileSets?: any[];
    offset?: {
        x: number;
        y: number;
    };
}): (arg0: layer, arg1: index) => GroupLayer;
export function convertLayersToTmx({ layers, resources, number, crop, name }: {
    layers?: any[];
    resources?: {};
    number?: number;
    crop?: boolean;
    name?: string;
}): Map;
declare const _default: any;
export default _default;
//# sourceMappingURL=converter.d.ts.map