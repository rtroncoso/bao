/**
 * MapObject class
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {number} type
 * @property {number} width
 * @property {number} height
 * @property {number} amount
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number|Graphic} graphic
 */
export default class MapObject {
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
        graphic?: number;
    });
    id: number;
    x: number;
    y: number;
    type: number;
    width: number;
    height: number;
    amount: number;
    offsetX: number;
    offsetY: number;
    graphic: number;
}
//# sourceMappingURL=MapObject.d.ts.map