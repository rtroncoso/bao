precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 inputSize;
uniform vec4 filterClamp;

uniform float time;
uniform float waveSpeed;
uniform float waveAmpPx;
uniform float waveAmpVerticalPx;
uniform vec4 waterEdges;
uniform float edgeBandHorizontal;
uniform float edgeBandVerticalNorth;
uniform float edgeBandVerticalSouth;
uniform vec2 worldOrigin;
uniform vec2 contentSizePx;
uniform vec2 tileSizePx;
uniform float filterPadding;

float edgeProximity(float distFromWater, float band) {
  return pow(1.0 - smoothstep(0.0, band, distFromWater), 3.0);
}

vec2 waterEdgeWaveOffset(vec2 uv) {
  vec2 offsetPx = vec2(0.0);
  float phase = time * waveSpeed;
  float waveScale = 0.35;

  vec2 localPx = uv * inputSize - vec2(filterPadding);
  vec2 worldPx = worldOrigin + localPx;
  vec2 tileLocalUv = mod(localPx + vec2(0.001), tileSizePx) / tileSizePx;

  if (waterEdges.x > 0.5) {
    float weight = edgeProximity(tileLocalUv.y, edgeBandVerticalNorth);
    offsetPx.y -= sin(phase + worldPx.x * waveScale) * waveAmpVerticalPx * weight;
  }

  if (waterEdges.z > 0.5) {
    float weight = edgeProximity(1.0 - tileLocalUv.y, edgeBandVerticalSouth);
    offsetPx.y += sin(phase + worldPx.x * waveScale) * waveAmpVerticalPx * weight;
  }

  if (waterEdges.w > 0.5) {
    float weight = edgeProximity(tileLocalUv.x, edgeBandHorizontal);
    offsetPx.x -= sin(phase + worldPx.y * waveScale) * waveAmpPx * weight;
  }

  if (waterEdges.y > 0.5) {
    float weight = edgeProximity(1.0 - tileLocalUv.x, edgeBandHorizontal);
    offsetPx.x += sin(phase + worldPx.y * waveScale) * waveAmpPx * weight;
  }

  return offsetPx / max(inputSize, vec2(1.0));
}

void main(void) {
  vec2 texel = 1.0 / max(inputSize, vec2(1.0));
  vec2 insetMin = filterClamp.xy + texel * 0.5;
  vec2 insetMax = filterClamp.zw - texel * 0.5;
  vec2 uv = clamp(vTextureCoord, insetMin, insetMax);
  vec2 sampleUv = clamp(uv + waterEdgeWaveOffset(uv), insetMin, insetMax);
  gl_FragColor = texture2D(uSampler, sampleUv);
}
