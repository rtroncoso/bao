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
  constructor({
    id = 0,
    x = 0,
    y = 0,
    type = 0,
    width = 0,
    height = 0,
    amount = 0,
    offsetX = 0,
    offsetY = 0,
    graphic = 0,
  }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = width;
    this.height = height;
    this.amount = amount;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.graphic = graphic;
  }
}
