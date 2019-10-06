precision mediump float;

uniform sampler2D displacementTexture;
uniform sampler2D normalTexture;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform vec2 camera;
uniform vec2 dimensions;
uniform vec4 filterArea;
uniform vec4 filterClamp;

uniform float aspectRatio;
uniform vec2 scaleFactor;
uniform vec2 tileFactor;

uniform vec2 uvAmplitude;
uniform vec2 uvOffsetSize;
uniform float uvTimeScale;

uniform float time;
uniform float waveTimeScale;
uniform vec2 waveScale;
uniform vec2 waveAmplitude;

vec2 offsetTextureUvs(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 offsetTextureUvs = uv * scale;
  offsetTextureUvs.x -= sin(time * timeScale + (uv.x + uv.y));
  offsetTextureUvs.y -= cos(time * timeScale + (uv.x + uv.y));
  return offsetTextureUvs;
}

vec2 textureBasedOffset(sampler2D displacement, vec2 uv) {
  vec2 textureBasedOffset = texture2D(displacement, uv).rg;
  textureBasedOffset = textureBasedOffset * 2. - 1.;
  return textureBasedOffset;
}

vec2 wavesOffset(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 wavesOffset = uv;
  wavesOffset.x = cos(time * timeScale + (uv.x + uv.y) * scale.x);
  wavesOffset.y = sin(time * timeScale + (uv.x + uv.y) * scale.y);
  return wavesOffset;
}

vec2 tiledUvs(vec2 uv, vec2 tf) {
  vec2 tiledUvs = fract(uv * tf);
  return (tiledUvs * .5) + .5;
}

vec2 scaledUvs(vec2 uv, vec2 sf) {
  vec2 scaledUvs = uv * sf;
  return scaledUvs;
}

vec2 cameraCoords(vec2 coords, vec2 camera) {
  vec2 cameraCoord = vec2((camera.x * 1.6) + coords.x, (camera.y * 0.9) + coords.y);
  return cameraCoord;
}

void main(void) {
  vec2 pixelCoord = vTextureCoord * filterArea.xy;
  vec2 normalizedCoord = pixelCoord / dimensions;
  vec2 screenCoord = (vTextureCoord * filterArea.xy + filterArea.zw);
  vec2 clampedCoord = clamp(vTextureCoord, filterClamp.xy, filterClamp.zw);

  vec2 tiledUvs = tiledUvs(vTextureCoord, tileFactor);
  vec2 scaledUvs = scaledUvs(vTextureCoord, scaleFactor);
  vec2 cameraCoord = cameraCoords(vTextureCoord, camera);

  vec2 offsetTextureUvs = offsetTextureUvs(time, cameraCoord, uvOffsetSize, uvTimeScale);
  vec2 textureBasedOffset = textureBasedOffset(displacementTexture, offsetTextureUvs);
  vec2 wavesOffset = wavesOffset(time, scaledUvs, waveScale, waveTimeScale);

  vec2 waveCoords = scaledUvs + (textureBasedOffset * uvAmplitude) + (wavesOffset * waveAmplitude);
  // gl_FragColor = vec4(textureBasedOffset, 0.0, 1.0); // texture2D(uSampler, vTextureCoord);
  gl_FragColor = texture2D(uSampler, waveCoords);
}
