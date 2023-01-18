/**
 * Weapon model
 * @param {number} id
 * @param {Graphic|number} up
 * @param {Graphic|number} left
 * @param {Graphic|number} down
 * @param {Graphic|number} right
 * @exports Weapon
 */
export default class Weapon {
    constructor({ id, up, left, down, right, }: {
        id?: number;
        up?: number;
        left?: number;
        down?: number;
        right?: number;
    });
    id: number;
    up: number;
    left: number;
    down: number;
    right: number;
}
//# sourceMappingURL=Weapon.d.ts.map