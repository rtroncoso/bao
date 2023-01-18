import { Graphic } from '@mob/core/models';
/**
 * Weapon model
 */
export declare class Weapon {
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
//# sourceMappingURL=Weapon.d.ts.map