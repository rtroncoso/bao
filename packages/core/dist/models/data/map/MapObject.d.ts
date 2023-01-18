import { Graphic } from '@mob/core/models';
/**
 * MapObject class
 */
export declare class MapObject {
    id: number;
    x: number;
    y: number;
    type: number;
    width: number;
    height: number;
    amount: number;
    offsetX: number;
    offsetY: number;
    graphic: Graphic | null;
    constructor({ id, x, y, type, width, height, amount, offsetX, offsetY, graphic, }: {
        id?: number;
        x?: number;
        y?: number;
        type?: number;
        width?: number;
        height?: number;
        amount?: number;
        offsetX?: number;
        offsetY?: number;
        graphic?: any;
    });
}
//# sourceMappingURL=MapObject.d.ts.map