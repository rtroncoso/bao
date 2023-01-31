precision mediump float;

varying vec2 vTextureCoord;
uniform vec2 inputSize;
uniform vec4 outputFrame;
uniform sampler2D uSampler;
uniform sampler2D texture;
uniform sampler2D normalTexture;
uniform sampler2D displacementTexture;

uniform vec3 colorDamp;
uniform vec2 tileFactor;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform vec2 camera;

uniform float time;
uniform float waveTimeScale;
uniform vec2 waveScale;
uniform vec2 waveAmplitude;

uniform float uvTimeScale;
uniform vec2 uvOffsetSize;
uniform vec2 uvAmplitude;

vec2 tiledUvs(vec2 uv, vec2 tf) {
  vec2 tiledUvs = uv * tf / 1.5;
  return tiledUvs;
}

vec2 offsetTextureUvs(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 offsetTextureUvs = uv * scale;
  offsetTextureUvs.x -= sin(time * timeScale);
  offsetTextureUvs.y -= cos(time * timeScale);
  return offsetTextureUvs;
}

vec2 textureBasedOffset(sampler2D displacement, vec2 uv) {
  vec2 textureBasedOffset = texture2D(displacement, uv).rg;
  return textureBasedOffset * 2.0 - 1.0;
}

vec2 wavesOffset(float time, vec2 uv, vec2 scale, float timeScale) {
  vec2 wavesOffset = uv * scale;
  wavesOffset.x += sin(time * timeScale + (uv.x + uv.y));
  wavesOffset.y += cos(time * timeScale + (uv.x + uv.y));
  return wavesOffset * 2.0 - 1.0;
}

vec2 cameraCoords(vec2 coords, vec2 camera) {
  vec2 cameraCoord = coords + camera;
  return cameraCoord;
}

void main(void) {
  vec2 uvs = vTextureCoord.xy * inputSize.xy / outputFrame.zw;
  vec2 cameraCoord = cameraCoords(uvs, camera);

  vec2 tiledUvs = tiledUvs(cameraCoord, tileFactor);
  vec2 offsetTextureUvs = offsetTextureUvs(time, cameraCoord, uvOffsetSize, uvTimeScale);
  vec2 textureBasedOffset = textureBasedOffset(displacementTexture, offsetTextureUvs);
  vec2 wavesOffset = wavesOffset(time, cameraCoord, waveScale, waveTimeScale);

  vec2 waveCoords = tiledUvs + (textureBasedOffset * uvAmplitude) + (wavesOffset * waveAmplitude);
  // gl_FragColor = vec4(textureBasedOffset, 1.0, 1.0);
  vec4 color = texture2D(texture, waveCoords);
  gl_FragColor = vec4(
    color.r * colorDamp.r,
    color.g * colorDamp.g,
    color.b * colorDamp.b,
    color.a
  );
}
