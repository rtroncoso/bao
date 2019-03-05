import { Point, Rectangle } from 'pixi.js';

export default function Camera() {
  this.position = new Point(0, 0);
  this.projection = new Rectangle();
  this.bounds = new Rectangle();
}
