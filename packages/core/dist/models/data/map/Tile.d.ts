/**
 * Tile model
 * @property {Npc} npc
 * @property {MapObject} object
 * @property {TileExit} tileExit
 * @property {number} trigger
 * @property {boolean} blocked
 * @property {Graphic|number} graphic
 * @property {Graphic|number} animation
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} layer
 * @property {number} x
 * @property {number} y
 */
export default class Tile {
    constructor({ blocked, animation, graphic, offsetX, offsetY, object, npc, tileExit, trigger, layer, x, y }: {
        blocked?: boolean;
        animation?: number;
        graphic?: number;
        offsetX?: number;
        offsetY?: number;
        object?: any;
        npc?: any;
        tileExit?: any;
        trigger?: number;
        layer?: number;
        x?: number;
        y?: number;
    });
    npc: any;
    animation: number;
    graphic: number;
    blocked: boolean;
    object: any;
    tileExit: any;
    trigger: number;
    offsetX: number;
    offsetY: number;
    layer: number;
    x: number;
    y: number;
    toScreen(): {
        x: number;
        y: number;
    };
    isWater(): boolean;
}
//# sourceMappingURL=Tile.d.ts.map