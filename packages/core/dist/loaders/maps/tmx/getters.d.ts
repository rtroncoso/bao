import { GroupLayer, ImageLayer, ObjectLayer, TileLayer, Tiled } from '@mob/core/models';
type LayerType = TileLayer & ObjectLayer & GroupLayer & ImageLayer;
/**
 * Groups all TMX layers in one array
 */
export declare const getFlattenedLayers: (layers: Array<LayerType>) => any;
/**
 * Groups all TMX layers in one array from tmx
 */
export declare const getFlattenedLayersFromTmx: (tmx: Tiled) => any;
/**
 * Filters TMX layers by a layer type
 */
export declare const getFilteredLayersFromTmx: ({ tmx, type, visible }: {
    tmx: Tiled;
    type: string;
    visible: boolean;
}) => any;
export declare const getImageLayersFromTmx: (tmx: Tiled) => any;
export declare const getGroupLayersFromTmx: (tmx: Tiled) => any;
export declare const getObjectLayersFromTmx: (tmx: Tiled) => any;
/**
 * Parse and append `usedTileSets` property into tile layers from TMX
 */
export declare const getTileLayersFromTmx: (tmx: Tiled) => any;
export declare const getObjectsFromObjectLayers: (layers: Array<LayerType>) => any;
export declare const getSpritesFromObjectLayers: (layers: Array<LayerType>) => any;
export declare const getCollisionsFromObjectLayers: (layers: Array<LayerType>) => any;
export declare const getTriggersFromObjectLayers: (layers: Array<LayerType>) => any;
export declare const getWaterFromObjectLayers: (layers: Array<LayerType>) => any;
export {};
//# sourceMappingURL=getters.d.ts.map