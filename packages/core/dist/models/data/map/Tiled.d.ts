/**
 * Interfaces for use with Tiled TMX formats
 */
export const TILE_LAYER_TYPE: "tilelayer";
export const OBJECT_LAYER_TYPE: "objectgroup";
export const IMAGE_LAYER_TYPE: "imagelayer";
export const GROUP_LAYER_TYPE: "group";
export class Map {
    version: string;
    tiledversion: string;
    orientation: string;
    infinite: boolean;
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    backgroundcolor: any;
    layers: any[];
    properties: any[];
    tilesets: any[];
}
export class TileSet {
    firstgid: number;
    source: string;
    name: string;
    mergeTo(other: any): void;
}
export class Image {
    format: any;
    source: string;
    trans: any;
    width: number;
    height: number;
}
export class Tile {
    id: number;
    terrain: any[];
    probability: any;
    properties: any[];
    animations: any[];
    objectGroups: any[];
    image: any;
}
export class TileLayer {
    constructor(map: any);
    map: any;
    type: string;
    name: any;
    opacity: number;
    visible: boolean;
    properties: any[];
    offsety: number;
    offsetx: number;
    tileAt(x: any, y: any): any;
    setTileAt(x: any, y: any, tile: any): void;
}
export class ObjectLayer {
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
}
export class ImageLayer {
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
}
export class GroupLayer {
    id: any;
    type: string;
    name: any;
    opacity: number;
    visible: boolean;
    layers: any[];
    x: number;
    y: number;
}
export class TmxObject {
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
}
export class Terrain {
    name: string;
    tile: number;
    properties: any[];
}
//# sourceMappingURL=Tiled.d.ts.map