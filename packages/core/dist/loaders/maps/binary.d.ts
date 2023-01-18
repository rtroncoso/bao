export function parseBinaryTile(mapBuffer: BufferAdapter, infBuffer: BufferAdapter): (arg0: x, arg1: y) => LayeredTile;
export function iterate(action?: () => void): any;
export function mapBinaryLayers(buffer: any, process: any): Array<Array<LayeredTile>>;
export function translateTileExits(tiles: any, amount?: number): (arg0: x, arg1: y) => LayeredTile;
export function getBinaryTiles(graphics: Array<number | Graphic>, animations: Array<Graphic>, mapFile: Uint8Array, infFile: Uint8Array, datFile: {
    [x: string]: MapInfo;
}, translateExits?: boolean): Array<Array<LayeredTile>>;
export function getBinaryLayers(graphics: Array<number | Graphic>, animations: Array<Graphic>, objects: Array<MapObject>, mapFile: Uint8Array, infFile: Uint8Array, datFile: {
    [x: string]: MapInfo;
}): Array<Array<Array<Tile>>>;
export function getFlattenedTiles(graphics: Array<number | Graphic>, animations: Array<Graphic>, mapFile: Uint8Array, infFile: Uint8Array): Array<Tile>;
declare const _default: any;
export default _default;
//# sourceMappingURL=binary.d.ts.map