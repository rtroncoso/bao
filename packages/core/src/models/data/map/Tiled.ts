/**
 * Interfaces for use with Tiled TMX formats
 */

export const TILE_LAYER_TYPE = 'tilelayer';
export const OBJECT_LAYER_TYPE = 'objectgroup';
export const IMAGE_LAYER_TYPE = 'imagelayer';
export const GROUP_LAYER_TYPE = 'group';

export class Tiled {
  version: string;
  tiledversion: string;
  orientation: string;
  name: string;
  infinite: boolean;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  backgroundcolor: any;
  layers: any[];
  properties: any[];
  tilesets: any[];

  constructor() {
    this.version = '1.2';
    this.tiledversion = '1.2.1';
    this.orientation = 'orthogonal';
    this.name = '';
    this.infinite = false;
    this.width = 0;
    this.height = 0;
    this.tilewidth = 0;
    this.tileheight = 0;
    this.backgroundcolor = null;

    this.layers = [];
    this.properties = [];
    this.tilesets = [];
  }
}

export class TileSet {
  firstgid: number;
  imagePath: string;
  name: string;
  source: string;
  spriteSheetSource: string;

  constructor() {
    this.firstgid = 0;
    this.imagePath = '';
    this.name = '';
    this.source = '';
    this.spriteSheetSource = '';
  }

  mergeTo(other) {
    other.firstgid = this.firstgid == null ? other.firstgid : this.firstgid;
    other.source = this.source == null ? other.source : this.source;
    other.name = this.name == null ? other.name : this.name;
  }
}

export class Image {
  format: any;
  source: string;
  trans: any;
  width: number;
  height: number;
  constructor() {
    this.format = null;
    this.source = '';
    this.trans = null;
    this.width = 0;
    this.height = 0;
  }
}

export class TmxTile {
  id: number;
  terrain: any[];
  probability: any;
  properties: any[];
  animations: any[];
  objectGroups: any[];
  image: any;
  constructor() {
    this.id = 0;
    this.terrain = [];
    this.probability = null;
    this.properties = [];
    this.animations = [];
    this.objectGroups = [];
    this.image = null;
  }
}

export class TileLayer {
  id: number;
  map: Tiled;
  type: string;
  name: string;
  opacity: number;
  visible: boolean;
  data: number[];
  properties: any[];
  offsety: number;
  offsetx: number;
  tiles: any;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(map) {
    this.map = map;
    this.type = TILE_LAYER_TYPE;
    this.name = null;
    this.opacity = 1;
    this.visible = true;
    this.properties = [];
    this.offsety = 0;
    this.offsetx = 0;
    this.x = 0;
    this.y = 0;
    // this.data = new Array(tileCount);
    // this.horizontalFlips = new Array(tileCount);
    // this.verticalFlips = new Array(tileCount);
    // this.diagonalFlips = new Array(tileCount);
  }

  tileAt(x, y) {
    return this.tiles[y * this.map.width + x];
  }

  setTileAt(x, y, tile) {
    this.tiles[y * this.map.width + x] = tile;
  }
}

export class ObjectLayer {
  id: number;
  type: string;
  drawOrder: string;
  name: any;
  color: any;
  opacity: number;
  visible: boolean;
  properties: any[];
  objects: any[];
  offsetx: number;
  offsety: number;
  x: number;
  y: number;

  constructor() {
    this.type = OBJECT_LAYER_TYPE;
    this.drawOrder = 'topdown';
    this.name = null;
    this.color = null;
    this.opacity = 1;
    this.visible = true;
    this.properties = [];
    this.objects = [];
    this.offsetx = 0;
    this.offsety = 0;
    this.x = 0;
    this.y = 0;
  }
}

export class ImageLayer {
  id: number;
  type: string;
  name: any;
  x: number;
  y: number;
  opacity: number;
  visible: boolean;
  properties: any[];
  image: any;
  offsetx: number;
  offsety: number;
  constructor() {
    this.type = IMAGE_LAYER_TYPE;
    this.name = null;
    this.x = 0;
    this.y = 0;
    this.opacity = 1;
    this.visible = true;
    this.properties = [];
    this.image = null;
    this.offsetx = 0;
    this.offsety = 0;
  }
}

export class GroupLayer {
  id: number;
  type: string;
  name: string;
  opacity: number;
  visible: boolean;
  layers: any[];
  x: number;
  y: number;
  constructor() {
    this.id = null;
    this.type = GROUP_LAYER_TYPE;
    this.name = null;
    this.opacity = 1;
    this.visible = true;
    this.layers = [];
    this.x = 0;
    this.y = 0;
  }
}

export class TmxObject {
  name: any;
  type: any;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: any[];
  id: any;
  visible: boolean;
  ellipse: boolean;
  polygon: any;
  polyline: any;

  constructor() {
    this.name = null;
    this.type = null;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.properties = [];
    this.id = null;
    this.visible = true;
    this.ellipse = false;
    this.polygon = null;
    this.polyline = null;
  }
}

export class Terrain {
  name: string;
  tile: number;
  properties: any[];
  constructor() {
    this.name = '';
    this.tile = 0;
    this.properties = [];
  }
}
