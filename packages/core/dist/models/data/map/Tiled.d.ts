/**
 * Interfaces for use with Tiled TMX formats
 */
export declare const TILE_LAYER_TYPE = "tilelayer";
export declare const OBJECT_LAYER_TYPE = "objectgroup";
export declare const IMAGE_LAYER_TYPE = "imagelayer";
export declare const GROUP_LAYER_TYPE = "group";
export declare class Tiled {
    version: string;
    tiledversion: string;
    orientation: string;
    name: string;
    infinite: boolean;
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    backgroundcolor: any;
    layers: any[];
    properties: any[];
    tilesets: any[];
    constructor();
}
export declare class TileSet {
    firstgid: number;
    imagePath: string;
    name: string;
    source: string;
    spriteSheetSource: string;
    constructor();
    mergeTo(other: any): void;
}
export declare class Image {
    format: any;
    source: string;
    trans: any;
    width: number;
    height: number;
    constructor();
}
export declare class TmxTile {
    id: number;
    terrain: any[];
    probability: any;
    properties: any[];
    animations: any[];
    objectGroups: any[];
    image: any;
    constructor();
}
export declare class TileLayer {
    id: number;
    map: Tiled;
    type: string;
    name: string;
    opacity: number;
    visible: boolean;
    data: number[];
    properties: any[];
    offsety: number;
    offsetx: number;
    tiles: any;
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(map: any);
    tileAt(x: any, y: any): any;
    setTileAt(x: any, y: any, tile: any): void;
}
export declare class ObjectLayer {
    id: number;
    type: string;
    drawOrder: string;
    name: any;
    color: any;
    opacity: number;
    visible: boolean;
    properties: any[];
    objects: any[];
    offsetx: number;
    offsety: number;
    x: number;
    y: number;
    constructor();
}
export declare class ImageLayer {
    id: number;
    type: string;
    name: any;
    x: number;
    y: number;
    opacity: number;
    visible: boolean;
    properties: any[];
    image: any;
    offsetx: number;
    offsety: number;
    constructor();
}
export declare class GroupLayer {
    id: number;
    type: string;
    name: string;
    opacity: number;
    visible: boolean;
    layers: any[];
    x: number;
    y: number;
    constructor();
}
export declare class TmxObject {
    name: any;
    type: any;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    properties: any[];
    id: any;
    visible: boolean;
    ellipse: boolean;
    polygon: any;
    polyline: any;
    constructor();
}
export declare class Terrain {
    name: string;
    tile: number;
    properties: any[];
    constructor();
}
//# sourceMappingURL=Tiled.d.ts.map