import { Rectangle, SCALE_MODES, Texture } from 'pixi.js';

export interface GraphicModelConstructor {
  fileName?: string | number;
  frames?: number[] | Graphic[];
  height?: number;
  id: string | number;
  path?: string | number;
  speed?: number;
  textures?: Texture[];
  width?: number;
  x?: number;
  y?: number;
}

/**
 * Graphic Model
 */
export class Graphic {
  fileName: string | number;
  frames: number[] | Graphic[];
  height: number;
  id: string | number;
  path: string | number;
  region: Rectangle;
  speed: number;
  textures: Texture[];
  width: number;
  x: number;
  y: number;

  constructor({
    fileName = '',
    frames = [],
    height = 0,
    id = 0,
    path = '',
    speed = 0.0,
    textures = [],
    width = 0,
    x = 0,
    y = 0,
  }: GraphicModelConstructor) {
    this.fileName = fileName;
    this.frames = frames;
    this.height = height;
    this.id = id;
    this.path = path;
    this.speed = speed;
    this.textures = textures;
    this.width = width;
    this.x = x;
    this.y = y;

    this.region = new Rectangle(this.x, this.y, this.width, this.height);
  }
}

/**
 * TexturedGraphic Model
 */
export class TexturedGraphic extends Graphic {
  private _texture: Texture;

  constructor(options: GraphicModelConstructor) {
    super(options);
    this.texture = Texture.EMPTY;
  }

  get isLoaded() { return this._texture !== Texture.EMPTY; }

  get texture() {
    if (!this.isLoaded) {
      this.texture = Texture.from(this.path as string).clone();
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
