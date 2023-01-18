export function getIndex(x: any, y: any, size?: any): number;
export function getTileIndex(x: any, y: any, size?: any, tileSize?: any): number;
export function getPropertyType(value: any): any;
export function getValueForType(value: any, type: any): any;
export function createProperty(layer: any, name: any, value: any): any;
export function setProperty(layer: any, name: any, value: any): any;
export function getProperty(layer: any, name: any): any[] | any;
export function ySortLayers(a: any, b: any): number;
export function findInTileSets({ graphic, tileSets, resources }: {
    graphic: any;
    tileSets?: any[];
    resources?: {};
}): {
    frame;
    id;
} | null;
//# sourceMappingURL=util.d.ts.map