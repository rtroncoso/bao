precision mediump float;

uniform vec2 inputSize;
uniform vec4 outputFrame;
varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec2 position;
uniform vec2 dimensions;
uniform float tileSize;
uniform float time;

void main(void) {
  vec2 uvs = vTextureCoord.xy * inputSize.xy / outputFrame.zw;
  vec4 fg = texture2D(uSampler,uvs);

  vec2 worldSpace;
  vec2 tileGrid;
  vec3 color;

  worldSpace.x = uvs.x + (position.x / dimensions.x);
  worldSpace.y = uvs.y + (position.y / dimensions.y);
  tileGrid.x = fract(worldSpace.x * (dimensions.x / tileSize));
  tileGrid.y = fract(worldSpace.y * (dimensions.y / tileSize));

  if (
    (tileGrid.x <= .03 || tileGrid.x >= .97)
  ) {
    color.r = tileGrid.x * (sin(time * .03) * .5 + .5);
    color.g = (tileGrid.x + tileGrid.y) * (sin(time * .03) * .5 + .5);
    color.b = tileGrid.y * (sin(time * .03) * .5 + .5);
    color.r = clamp(color.r, .2, .4);
    color.g = clamp(color.g, .1, .3);
    color.b = clamp(color.b, .4, .8);
  }
  if (
    (tileGrid.y<=.03||tileGrid.y>=.97)
  ) {
    color.r = tileGrid.x + (cos(time * .03) * .5 + .5);
    color.g = (worldSpace.x + worldSpace.y) * (cos(time * .03) * .5 + .5);
    color.b = tileGrid.y + (cos(time * .03) * .5 + .5);
    color.r = clamp(color.r, .2, .4);
    color.g = clamp(color.g, .1, .3);
    color.b = clamp(color.b, .4, .8);
  }

  color = color * .5;
  gl_FragColor = vec4(color, .2);
}
