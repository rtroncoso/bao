/**
 * Effect model
 * @param {number} id
 * @param {Graphic|number} animation
 * @param {number} offsetX
 * @param {number} offsetY
 * @exports Effect
 */
export default class Effect {
    constructor({ id, animation, offsetX, offsetY }: {
        id?: number;
        animation?: number;
        offsetX?: number;
        offsetY?: number;
    });
    id: number;
    animation: number;
    offsetX: number;
    offsetY: number;
}
//# sourceMappingURL=Effect.d.ts.map