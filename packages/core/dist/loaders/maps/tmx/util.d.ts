/**
 * Obtains 1D array index for a given x, y coordinate
 * @param x
 * @param y
 * @param size
 * @returns {number}
 */
export declare const getIndex: (x: any, y: any, size?: number) => any;
/**
 * Obtains 1D array index for a given x, y coordinate and tile size
 * @param x
 * @param y
 * @param size
 * @param tileSize
 * @returns {number}
 */
export declare const getTileIndex: (x: any, y: any, size?: number, tileSize?: number) => any;
/**
 * Obtains a tiled property type from it's value
 * @param value
 * @returns {*}
 */
export declare const getPropertyType: (value: any) => string;
/**
 * Converts property value to a given type
 * @param value
 * @param type
 * @returns {*}
 */
export declare const getValueForType: (value: any, type: any) => string | number | boolean;
/**
 * Creates and appends a property into a layer
 * @param layer
 * @param name
 * @param value
 */
export declare const createProperty: (layer: any, name: any, value: any) => any;
/**
 * Sets or creates a property for a layer
 * @param layer
 * @param name
 * @param value
 */
export declare const setProperty: (layer: any, name: any, value: any) => any;
/**
 * Gets a property from a layer by property name
 * @param layer
 * @param name
 * @returns {Array|*}
 */
export declare const getProperty: (layer: any, name: any) => any;
/**
 * ySort for tmx layers
 * @param a
 * @param b
 * @returns {number}
 */
export declare const ySortLayers: (a: any, b: any) => number;
/**
 * Searches given `tileSets` for a `graphic` model
 * @param graphic
 * @param tileSets
 * @param resources
 * @returns {{frame, id}|null}
 */
export declare const findInTileSets: ({ graphic, tileSets, resources }: {
    graphic: any;
    tileSets?: any[];
    resources?: {};
}) => any;
//# sourceMappingURL=util.d.ts.map