/**
 * Interfaces for use with Tiled TMX formats
 */

export const TILE_LAYER_TYPE = 'tilelayer';
export const OBJECT_LAYER_TYPE = 'objectgroup';
export const IMAGE_LAYER_TYPE = 'imagelayer';
export const GROUP_LAYER_TYPE = 'group';

export class Map {
  constructor() {
    this.version = '1.2';
    this.tiledversion = '1.2.1';
    this.orientation = 'orthogonal';
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
  constructor() {
    this.firstgid = 0;
    this.source = '';
    this.name = '';
  }

  mergeTo(other) {
    other.firstgid = this.firstgid == null ? other.firstgid : this.firstgid;
    other.source = this.source == null ? other.source : this.source;
    other.name = this.name == null ? other.name : this.name;
  }
}

export class Image {
  constructor() {
    this.format = null;
    this.source = '';
    this.trans = null;
    this.width = 0;
    this.height = 0;
  }
}

export class Tile {
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
  constructor(map) {
    this.map = map;
    this.type = TILE_LAYER_TYPE;
    this.name = null;
    this.opacity = 1;
    this.visible = true;
    this.properties = [];
    this.offsety = 0;
    this.offsetx = 0;
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
  }
}

export class ImageLayer {
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
  constructor() {
    this.name = '';
    this.tile = 0;
    this.properties = [];
  }
}
