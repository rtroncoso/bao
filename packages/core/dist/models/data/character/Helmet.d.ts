import { Graphic } from '@mob/core/models';
/**
 * Helmet model
 */
export declare class Helmet {
    id: number;
    up: Graphic | number;
    left: Graphic | number;
    down: Graphic | number;
    right: Graphic | number;
    constructor({ id, up, left, down, right, }: {
        id?: number;
        up?: number;
        left?: number;
        down?: number;
        right?: number;
    });
}
//# sourceMappingURL=Helmet.d.ts.map