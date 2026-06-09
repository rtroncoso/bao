attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform vec4 outputFrame;
uniform vec4 inputSize;

varying vec2 vTextureCoord;

void main(void) {
  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  vTextureCoord = aVertexPosition * (outputFrame.zw * inputSize.zw);
}
