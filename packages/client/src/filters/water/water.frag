precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D normalTexture;
uniform sampler2D displacementTexture;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform vec2 camera;

uniform vec2 tileFactor;
uniform float aspectRatio;

uniform float time;
uniform float waveTimeScale;
uniform vec2 waveScale;
uniform vec2 waveAmplitude;

uniform float uvTimeScale;
uniform vec2 uvOffsetSize;
uniform vec2 uvAmplitude;

vec2 offsetTextureUvs(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 offsetTextureUvs = uv * scale;
  offsetTextureUvs.x -= sin(time * timeScale + (uv.x + uv.y));
  offsetTextureUvs.y -= cos(time * timeScale + (uv.x + uv.y));
  return offsetTextureUvs;
}

vec2 textureBasedOffset(sampler2D displacement, vec2 uv) {
  vec2 textureBasedOffset = texture2D(displacement, uv).rg;
  textureBasedOffset = textureBasedOffset * 2.0 - 1.0;
  return textureBasedOffset;
}

vec2 wavesOffset(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 wavesOffset = uv;
  wavesOffset.x = cos(time * timeScale + (uv.x + uv.y) * scale.x);
  wavesOffset.y = sin(time * timeScale + (uv.x + uv.y) * scale.y);
  return wavesOffset;
}

vec2 tiledUvs(vec2 uv, vec2 tf, float ar) {
  tf.x *= ar;
  tf.y *= ar;
  vec2 tiledUvs = uv * tf;
  return tiledUvs;
}

vec2 cameraCoords(vec2 coords, vec2 camera, float ar) {
  camera.x *= ar;
  camera.y *= ar;

  float bias = 1.69;
  vec2 cameraCoord = bias * camera + coords;
  return cameraCoord;
}

void main(void) {
  vec2 pixelCoord = vTextureCoord * filterArea.xy;
  vec2 normalizedCoord = pixelCoord / dimensions;
  vec2 screenCoord = (vTextureCoord * filterArea.xy + filterArea.zw);
  vec2 clampedCoord = clamp(vTextureCoord, filterClamp.xy, filterClamp.zw);
  vec2 cameraCoord = cameraCoords(clampedCoord, camera, aspectRatio);

  vec2 tiledUvs = tiledUvs(clampedCoord, tileFactor, aspectRatio);
  vec2 offsetTextureUvs = offsetTextureUvs(time, cameraCoord, uvOffsetSize, uvTimeScale);
  vec2 textureBasedOffset = textureBasedOffset(displacementTexture, offsetTextureUvs);
  vec2 wavesOffset = wavesOffset(time, cameraCoord, waveScale, waveTimeScale);

  vec2 waveCoords = tiledUvs + (textureBasedOffset * uvAmplitude) + (wavesOffset * waveAmplitude);
  gl_FragColor = texture2D(uSampler, waveCoords);
}
