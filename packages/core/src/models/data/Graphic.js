import { Rectangle, SCALE_MODES, Texture } from 'pixi.js';

/**
 * Graphic Model
 * @property {number} id
 * @property {Array.<Graphic|number>} frames
 * @property {Array.<PIXI.Texture>} textures
 * @property {string} fileName
 * @property {string} path
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} speed
 * @property {PIXI.Rectangle} region
 * @exports Graphic
 */
export default class Graphic {
  constructor({
    id = 0,
    frames = [],
    textures = [],
    fileName = '',
    path = '',
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    speed = 0.0,
  } = {}) {
    this.id = id;
    this.frames = frames;
    this.textures = [];
    this.fileName = fileName;
    this.path = path;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.region = new Rectangle(this.x, this.y, this.width, this.height);
  }
}

/**
 * TexturedGraphic Model
 * @property {Texture} texture
 * @extends Graphic
 */
export class TexturedGraphic extends Graphic {
  constructor(options = {}) {
    super(options);
    this.texture = Texture.EMPTY;
  }

  get isLoaded() { return this._texture !== Texture.EMPTY; }

  get texture() {
    if (!this.isLoaded) {
      this.texture = Texture.fromImage(this.path).clone();
    }

    return this._texture;
  }

  set texture(texture) {
    if (texture !== Texture.EMPTY) {
      const base = texture.baseTexture;
      base.scaleMode = SCALE_MODES.NEAREST;
      texture.frame = new Rectangle();

      if (
        base.width >= this.region.x + this.region.width &&
        base.height >= this.region.y + this.region.height
      ) {
        texture.frame = this.region;
      }
    }

    this._texture = texture;
  }
}
