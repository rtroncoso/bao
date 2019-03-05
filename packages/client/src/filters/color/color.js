import { Filter } from 'pixi.js';
import { easing, tween } from 'popmotion';
import VERT from './color.vert';
import FRAG from './color.frag';

export default class ColorFilter extends Filter {
  constructor(color = '#ffffff') {
    super(VERT, FRAG);
    this.color = color;
  }

  set color(color) {
    if (typeof color === 'number' && this._color !== color) {
      tween({
        to: color,
        from: this._color || '#ffffff',
        easing: easing.easeInOut,
        duration: 5000,
        flip: false
      }).start(c => this.uniforms.color = c);
      this._color = color;
    }
  }
}
