import { Filter, Matrix, Texture } from 'pixi.js';

import vertex from './water.vert';
import fragment from './water.frag';

export class WaterFilter extends Filter {
  constructor() {
    super(vertex, fragment);

    this.uniforms.time = 0;
    this.uniforms.camera = [0, 0];
    this.uniforms.dimensions = [0, 0];
    this.uniforms.tileFactor = [0.3, 0.3];
    this.uniforms.colorDamp = [0.9, 0.9, 0.8];
    this.uniforms.waveTimeScale = 0.1;
    this.uniforms.waveScale = [0.5, 0.5];
    this.uniforms.waveAmplitude = [0.02, 0.03];
    this.uniforms.uvTimeScale = -0.003;
    this.uniforms.uvOffsetSize = [2.2, 2.4];
    this.uniforms.uvAmplitude = [0.08, 0.15];
    this.uniforms.mappedMatrix = new Matrix();
    this.uniforms.texture = Texture.EMPTY;
    this.uniforms.normalTexture = Texture.EMPTY;
    this.uniforms.displacementTexture = Texture.EMPTY;

    this.autoFit = false;
    this.padding = 4;

    if (this.isRetina()) {
      this.resolution = 2;
    }
  }

  isRetina(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      ((window.matchMedia &&
        (window.matchMedia(
          'only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)'
        ).matches ||
          window.matchMedia(
            'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)'
          ).matches)) ||
        (window.devicePixelRatio && window.devicePixelRatio >= 2)) &&
      /(iPad|iPhone|iPod|Macintosh)/g.test(navigator.userAgent)
    );
  }

  apply(filterManager, input, output, clear): void {
    this.uniforms.dimensions[0] = input.filterFrame.width;
    this.uniforms.dimensions[1] = input.filterFrame.height;
    filterManager.applyFilter(this, input, output, clear);
  }
}
