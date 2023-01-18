export function getFlattenedLayers(layers: any): Array<TileLayer | ObjectLayer | GroupLayer | ImageLayer>;
export function getFlattenedLayersFromTmx(tmx: any): Array<TileLayer | ObjectLayer | GroupLayer | ImageLayer>;
export function getFilteredLayersFromTmx({ tmx, type, visible }: {
    tmx: any;
    type: any;
    visible: any;
}): Array<TileLayer | ObjectLayer | GroupLayer | ImageLayer>;
export function getImageLayersFromTmx(tmx: any): any[];
export function getGroupLayersFromTmx(tmx: any): any[];
export function getObjectLayersFromTmx(tmx: any): any[];
export function getTileLayersFromTmx(tmx: any): Array<TileLayer>;
export function getObjectsFromObjectLayers(layers: any): any;
export function getSpritesFromObjectLayers(layers: any): any;
export function getCollisionsFromObjectLayers(layers: any): any;
export function getTriggersFromObjectLayers(layers: any): any;
export function getWaterFromObjectLayers(layers: any): any;
declare const _default: any;
export default _default;
//# sourceMappingURL=getters.d.ts.map