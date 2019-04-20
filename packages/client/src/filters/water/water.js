import { Filter, Matrix } from 'pixi.js';

import VERT from './water.vert';
import FRAG from './water.frag';

class WaterShader extends Filter {
  constructor({ normal, displacement }) {
    super(VERT, FRAG);
    this.uniforms.time = 0;
    this.uniforms.normalTexture = normal;
    this.uniforms.displacementTexture = displacement;
    this.uniforms.tileFactor = [1.0, 1.0];
    this.uniforms.aspectRatio = 1.0;

    this.uniforms.waveTimeScale = 0.01;
    this.uniforms.waveScale = [0.2, 0.2];
    this.uniforms.waveAmplitude = [0.02, 0.03];
    this.uniforms.uvTimeScale = -0.003;
    this.uniforms.uvOffsetSize = [3.7, 4.5];
    this.uniforms.uvAmplitude = [0.08, 0.15];
    this.uniforms.mappedMatrix = new Matrix();

    this.autoFit = false;
    this.padding = 0;
  }

  apply(filterManager, input, output, clear, currentState) {
    this.uniforms.dimensions[0] = input.sourceFrame.width;
    this.uniforms.dimensions[1] = input.sourceFrame.height;
    if (input.sourceFrame.width > input.sourceFrame.height) {
      this.uniforms.aspectRatio = input.sourceFrame.height / input.sourceFrame.width;
    } else {
      this.uniforms.aspectRatio = input.sourceFrame.width / input.sourceFrame.height;
    }
    this.uniforms.mappedMatrix = filterManager.calculateNormalizedScreenSpaceMatrix(
      this.uniforms.mappedMatrix
    );
    filterManager.applyFilter(this, input, output);
  }

  update(delta, camera) {
    this.uniforms.time += delta * 0.01;
    this.uniforms.camera[0] = camera.x / camera.width;
    this.uniforms.camera[1] = camera.y / camera.height;
  }
}

export default WaterShader;
