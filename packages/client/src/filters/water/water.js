import { Filter, Matrix } from 'pixi.js';

import { canvasWidth, canvasHeight } from 'core/constants/game/App';
import VERT from './water.vert';
import FRAG from './water.frag';

class WaterShader extends Filter {
  constructor({ normal, displacement }) {
    super(VERT, FRAG);
    this.uniforms.displacementTexture = displacement;
    this.uniforms.normalTexture = normal;
    this.uniforms.mappedMatrix = new Matrix();
    this.uniforms.time = 0;

    this.uniforms.aspectRatio = 1.0;
    this.uniforms.scaleFactor = [0.6, 0.6];
    this.uniforms.tileFactor = [10.0, 10.0];

    this.uniforms.uvTimeScale = -0.003;
    this.uniforms.uvOffsetSize = [2.0, 2.5];
    this.uniforms.uvAmplitude = [0.08, 0.15];

    this.uniforms.waveTimeScale = 0.01;
    this.uniforms.waveScale = [1.0, 1.6];
    this.uniforms.waveAmplitude = [0.02, 0.03];

    this.autoFit = true;
    this.padding = 0;
  }

  update(delta, camera) {
    this.uniforms.time += delta * 0.025;
    this.uniforms.camera[0] = camera.x / (canvasWidth * 2.0);
    this.uniforms.camera[1] = camera.y / canvasHeight;
  }
}

export default WaterShader;
