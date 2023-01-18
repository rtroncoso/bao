/**
 * Head model
 * @param {number} id
 * @param {Graphic|number} up
 * @param {Graphic|number} left
 * @param {Graphic|number} down
 * @param {Graphic|number} right
 * @exports Head
 */
export default class Head {
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
//# sourceMappingURL=Head.d.ts.map