import { Graphic } from '@mob/core/models';
/**
 * Body model
 */
export declare class Body {
    id: number;
    up: Graphic | number;
    left: Graphic | number;
    down: Graphic | number;
    right: Graphic | number;
    headOffsetX: number;
    headOffsetY: number;
    constructor({ id, up, left, down, right, headOffsetX, headOffsetY }: {
        id?: number;
        up?: number;
        left?: number;
        down?: number;
        right?: number;
        headOffsetX?: number;
        headOffsetY?: number;
    });
}
//# sourceMappingURL=Body.d.ts.map