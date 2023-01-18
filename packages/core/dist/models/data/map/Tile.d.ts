import { Graphic, MapObject, Npc, TileExit } from '@mob/core/models';
/**
 * Tile model
 */
export declare class Tile {
    npc: Npc | null;
    animation: Graphic | null;
    graphic: Graphic | null;
    blocked: boolean;
    object: MapObject | null;
    tileExit: TileExit | null;
    trigger: number;
    offsetX: number;
    offsetY: number;
    layer: number;
    x: number;
    y: number;
    constructor({ blocked, animation, graphic, offsetX, offsetY, object, npc, tileExit, trigger, layer, x, y }: {
        blocked?: boolean;
        animation?: any;
        graphic?: any;
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
    toScreen(): {
        x: number;
        y: number;
    };
    isWater(): boolean;
}
//# sourceMappingURL=Tile.d.ts.map