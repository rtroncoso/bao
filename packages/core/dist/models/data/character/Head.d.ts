import { Graphic } from '@mob/core/models';
/**
 * Head model
 * @param {number} id
 * @param {Graphic|number} up
 * @param {Graphic|number} left
 * @param {Graphic|number} down
 * @param {Graphic|number} right
 * @exports Head
 */
export declare class Head {
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
//# sourceMappingURL=Head.d.ts.map