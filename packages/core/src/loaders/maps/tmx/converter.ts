import range from 'lodash/fp/range';

import pack from 'ndarray-pack';
import contour from 'contour-2d';
import decompose from 'rectangle-decomposition';

import { LoaderResource, Texture } from 'pixi.js';
import {
  ATLAS_COLUMNS,
  TILESET_SPRITESHEETS
} from '@mob/core/constants/game/Graphics';
import {
  ANIMATION_TYPE,
  COLLISION_LAYER,
  COLLISION_TYPE,
  MAP_BORDER_X,
  MAP_BORDER_Y,
  NPC_LAYER,
  NPC_TYPE,
  OBJECT_LAYER,
  OBJECT_TYPE,
  SPRITE_TYPE,
  TILE_EXIT_LAYER,
  TILE_EXIT_TYPE,
  TILE_SIZE,
  TILED_MAP_SIZE,
  TILES_LAYER,
  TRIGGER_LAYER,
  TRIGGER_ROOF,
  TRIGGER_TYPE,
  WATER_TYPE
} from '@mob/core/constants/game/Map';
import {
  createProperty,
  findInTileSets,
  getProperty,
  getTileIndex,
  ySortLayers
} from '@mob/core/loaders/maps/tmx/util';
import {
  getSpriteSheetFilePath,
  getSpriteSheetImagePath,
  getTileSetFilePath
} from '@mob/core/loaders/spritesheets';
import { getGraphicsFileName } from '@mob/core/loaders/util';
import {
  GroupLayer,
  ObjectLayer,
  Tiled,
  TileSet,
  TileLayer,
  TmxObject,
  ImageLayer,
  Tile,
  Graphic,
} from '@mob/core/models';

let lastId = 0;
let objectId = 0;

const config = {
  tilesetsType: 'tilesets'
}

/**
 * Fills an area of the map with the tiles that conform an object
 * of dimensions that are greater than TILE_SIZE
 */
export const makeTileLayerFromSprite = ({
  frame,
  tile,
  tilesData,
  tileSet
}) => {
  const { graphic } = tile;
  const layerCreator = (size: number) => new Array(size).fill(0);
  const nearestWidth = Math.ceil(graphic.width / TILE_SIZE);
  const nearestHeight = Math.ceil(graphic.height / TILE_SIZE);
  const offset = { x: tile.offsetX, y: tile.offsetY };
  const cornerX = (tile.x * TILE_SIZE) - offset.x;
  const cornerY = (tile.y * TILE_SIZE) - offset.y;
  const buffer = [];

  const createLayer = () => {
    const layer = layerCreator(TILED_MAP_SIZE[1])
      .map(() => layerCreator(TILED_MAP_SIZE[0]));

    layer[tile.y][tile.x] = tile;
    return layer;
  };

  for (let j = 0; j < nearestHeight; j++) {
    for (let i = 0; i < nearestWidth; i++) {
      const tileIndex =
        ((Math.floor(cornerY / TILE_SIZE) + j) * TILED_MAP_SIZE[0]) +
        Math.floor(cornerX / TILE_SIZE) + i;
      const index =
        ((Math.floor(frame.y / TILE_SIZE) + j) * ATLAS_COLUMNS) +
        Math.floor(frame.x / TILE_SIZE) + i;

      if (offset.x !== 0 || offset.y !== 0 || tilesData[tileIndex] > 0) {
        return { offset, layer: createLayer(), y: tile.y };
      }

      buffer[tileIndex] = tileSet.firstgid + index;
    }
  }

  // clear up the buffer
  for (let j = 0; j < nearestHeight; j++) {
    for (let i = 0; i < nearestWidth; i++) {
      const tileIndex =
        ((Math.floor(cornerY / TILE_SIZE) + j) * TILED_MAP_SIZE[0]) +
        Math.floor(cornerX / TILE_SIZE) + i;
      tilesData[tileIndex] = buffer[tileIndex];
    }
  }

  return true;
};

/**
 * Makes an Image Layer from a given frame and tile data
 */
export const makeImageLayer = ({
  frame,
  tile,
  tileSet,
  visible = true
}) => {
  const { graphic } = tile;
  const index = getTileIndex(frame.x, frame.y, ATLAS_COLUMNS);
  const layer = new ImageLayer();

  layer.visible = visible;
  layer.image = graphic.path;
  layer.offsetx = tile.x * TILE_SIZE - tile.offsetX;
  layer.offsety = tile.y * TILE_SIZE - tile.offsetY;

  createProperty(layer, 'x', layer.offsetx);
  createProperty(layer, 'y', layer.offsety);
  createProperty(layer, 'layer', tile.layer);
  createProperty(layer, 'width', graphic.width);
  createProperty(layer, 'height', graphic.height);
  createProperty(layer, 'graphicId', graphic.id);
  createProperty(layer, 'offsetx', layer.offsetx + tile.offsetX);
  createProperty(layer, 'offsety', layer.offsety + tile.offsetY);

  if (tileSet) {
    createProperty(layer, 'gid', tileSet.firstgid + index);
  }

  return layer;
};

export interface MakeRectParameters {
  data?: any;
  graphic?: Graphic;
  meta?: { [key: string]: any };
  name?: string | number;
  tile?: Tile;
  type?: string;
}

/**
 * Constructs an object in TMX format
 */
export const makeRect = ({
  data,
  graphic,
  meta = {},
  name = graphic.id,
  tile,
  type,
}: MakeRectParameters) => {
  const object = new TmxObject();

  object.type = type;
  object.name = name;
  object.id = ++objectId;
  object.x = tile.x * TILE_SIZE;
  object.y = tile.y * TILE_SIZE;
  object.width = TILE_SIZE;
  object.height = TILE_SIZE;

  if (meta) {
    if (graphic) {
      const fileName = graphic.frames.length > 0
        ? (graphic.frames[0] as Graphic).fileName
        : graphic.fileName;
      const fullFileName = getGraphicsFileName(fileName);
      const texture = Texture.from(fullFileName);
      createProperty(object, 'graphicId', graphic.id);
      createProperty(object, 'width', texture.width);
      createProperty(object, 'height', texture.height);
    }

    createProperty(object, 'x', object.x - tile.offsetX);
    createProperty(object, 'y', object.y - tile.offsetY);
    createProperty(object, 'layer', tile.layer);
    createProperty(object, 'offsetx', object.x);
    createProperty(object, 'offsety', object.y);

    for (const key of Object.keys(meta)) {
      createProperty(object, key, meta[key]);
    }
  }

  if (data) {
    const { frame, tileSet } = data;
    const index = getTileIndex(frame.x, frame.y, ATLAS_COLUMNS);
    createProperty(object, 'gid', tileSet.firstgid + index);
  }

  return object;
};

export const makeAnimation = (
  ({ type = ANIMATION_TYPE, ...props }: MakeRectParameters) =>makeRect({ ...props, type })
);

export const makeWater = (
  ({ type = WATER_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeCollision = (
  ({ type = COLLISION_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeTileExit = (
  ({ type = TILE_EXIT_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeTrigger = (
  ({ type = TRIGGER_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeObject = (
  ({ type = OBJECT_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeNpc = (
  ({ type = NPC_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type, name: '' })
);

export const makeSprite = (
  ({ type = SPRITE_TYPE, ...props }: MakeRectParameters) => makeRect({ ...props, type })
);

export interface MakeShapeParameters {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type?: string;
  polygon?: Array<{x: number, y: number}>;
}

/**
 * Makes a collision HitBox object from rect parameters
 */
export const makeShape = ({
  x,
  y,
  width,
  height,
  type = COLLISION_TYPE,
  polygon
}: MakeShapeParameters) => {
  const object = new TmxObject();
  object.id = ++objectId;
  object.type = type;
  object.x = x;
  object.y = y;
  object.width = width;
  object.height = height;

  if (polygon) {
    object.polygon = polygon;
  }

  return object;
};

export interface CropLayerParameters {
  layer: Tile[][];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Crops a map layer using x1, y1, x2, y2
 */
export const cropLayer = ({
  layer,
  x1,
  x2,
  y1,
  y2
}: CropLayerParameters) => {
  const cropped = range(y1, y2 + y1).map(y => range(x1, x2 + x1).map((x) => {
    const tile = layer[y][x];
    if (tile) {
      tile.x = x - x1;
      tile.y = y - y1;

      if (tile.tileExit) {
        tile.tileExit.x -= x1;
        tile.tileExit.y -= y1;
      }

      if (tile.npc) {
        tile.npc.x = tile.x - 4;
        tile.npc.y = tile.y;
      }

      if (tile.object) {
        tile.object.x = tile.x - 4;
        tile.object.y = tile.y;
      }
    }

    return tile;
  }));

  return cropped;
};

/**
 * Converts a list of TmxObject's into a list of minimal area
 * decomposed rectangles using `rectangle-decomposition`
 *
 * @see https://www.cise.ufl.edu/~sahni/papers/part.pdf
 */
const optimize = (type = COLLISION_TYPE) => (objects: TmxObject[]) => {
  const bitmap = range(0, TILED_MAP_SIZE[1]).map(() => range(0, TILED_MAP_SIZE[0]).map(() => 0));
  objects.forEach(c => bitmap[Math.floor(c.y / TILE_SIZE)][Math.floor(c.x / TILE_SIZE)] = 1);
  const paths = contour(pack(bitmap), true);
  const optimized = decompose(paths, false);
  const result: TmxObject[] = [];
  const polygons = [];

  optimized.forEach((rows: number[][]) => {
    const polygon = rows.map(vertex => ({ x: vertex[0], y: vertex[1] }));
    polygons.push(polygon);

    const [p1, p2] = polygon;
    const x = p1.x * TILE_SIZE;
    const y = p1.y * TILE_SIZE;
    const width = (p2.x - p1.x) * TILE_SIZE;
    const height = (p2.y - p1.y) * TILE_SIZE;
    const object = makeShape({ type, x, y, width, height });
    result.push(object);
  });

  return result;
};

/**
 * Converts a list of TmxObject's into a list of polygonal areas
 * using contour2D
 */
const optimizePolygons = (type: string = COLLISION_TYPE) => (objects: TmxObject[]) => {
  const bitmap = range(0, TILED_MAP_SIZE[1]).map(() => range(0, TILED_MAP_SIZE[0]).map(() => 0));
  objects.forEach(c => bitmap[Math.floor(c.y / TILE_SIZE)][Math.floor(c.x / TILE_SIZE)] = 1);
  const paths = contour(pack(bitmap), true);
  const polygons = [];
  const optimized: TmxObject[] = [];

  paths.forEach((rows: number[][]) => {
    const polygon = rows.map(vertex => ({ x: vertex[0] * TILE_SIZE, y: vertex[1] * TILE_SIZE }));
    polygons.push(polygon);

    // const offsetX = x - Math.floor((x - TILE_SIZE) / TILE_SIZE);
    // x -= offsetX; grid alignment - not needed
    const object = makeShape({ type, polygon });
    optimized.push(object);
  });

  return optimized;
};

export interface MakePolygonLayerParameters {
  layers?: TileLayer[];
  layerName?: string;
  objectLayerName?: string;
  layerNumber?: number;
  process?: (tile?: Tile) => TmxObject | void;
  postProcess?: (objects?: TmxObject[], shapes?: TmxObject[]) => TmxObject[];
  optimizer?: (list?: TmxObject[]) => TmxObject[];
}

/**
 * Traverses all tiles from a map and creates a polygon layer
 * using optimizer and process functions
 */
export const makePolygonLayer = ({
  layerName,
  layerNumber = TILES_LAYER,
  layers,
  objectLayerName,
  optimizer = i => i,
  postProcess = null,
  process = () => {},
}: MakePolygonLayerParameters) => {
  const layer = new GroupLayer();
  const objects = new ObjectLayer();
  layer.name = layerName;
  objects.name = objectLayerName;

  const l = layers[layerNumber - 1];
  const shapes = [];
  for (let y = 0; y < TILED_MAP_SIZE[1]; y++) {
    for (let x = 0; x < TILED_MAP_SIZE[0]; x++) {
      let tile = l[y][x];

      while (!tile && layerNumber < layers.length) {
        tile = layers[layerNumber++][y][x];
      }

      const shape = process(tile);
      if (shape) shapes.push(shape);
    }
  }

  const optimized = optimizer(shapes);
  objects.objects = postProcess ? postProcess(optimized, shapes) : optimized;
  layer.layers.push(objects);
  return layer;
};

/**
 * Makes a tile exit layer rectangle shapes
 */
export const makeTileExitsLayer = ({ layers }) => {
  const process = (tile: Tile) => {
    if (tile && tile.tileExit) {
      const { graphic } = tile;
      const meta = { mapNumber: tile.tileExit.map };
      return makeTileExit({ graphic, tile, meta });
    }

    return null;
  };

  const postProcess = (objects: TmxObject[], shapes: TmxObject[]) => (
    objects && objects.map((object: TmxObject) => {
      let tmxObject = null;

      // take neighboring tiles if available
      if (object.x + TILE_SIZE < object.width) {
        tmxObject = shapes.find(t => t.x === object.x + TILE_SIZE && t.y === object.y);
      } else if (object.y + TILE_SIZE < object.height) {
        tmxObject = shapes.find(t => t.x === object.x && t.y === object.y + TILE_SIZE);
      } else {
        tmxObject = shapes.find(t => t.x === object.x && t.y === object.y);
      }

      const mapNumber = getProperty(tmxObject, 'mapNumber');
      createProperty(object, 'mapNumber', mapNumber);
      return object;
    })
  );

  const layerName = 'Tile Exit Layer';
  const objectLayerName = 'Tile Exit HitBoxes';
  const layerNumber = TILE_EXIT_LAYER;
  return makePolygonLayer({
    layers,
    layerName,
    layerNumber,
    objectLayerName,
    process,
    postProcess,
    optimizer: optimize(TILE_EXIT_TYPE)
  });
};

/**
 * Makes a collision layer rectangle shapes
 */
export const makeCollisionLayer = ({ layers }) => {
  const process = (tile: Tile) => {
    if (tile && (tile.blocked || tile.isWater())) {
      const { graphic } = tile;
      return makeCollision({ graphic, tile });
    }

    return null;
  };

  // fixes weird contour2d edge case failing for ULLA
  const postProcess = (objects: TmxObject[]) => {
    const edgeCase = objects.find(c => c.width === 1728 && c.height === 2112);
    const index = objects.indexOf(edgeCase);

    if (edgeCase && index > -1) {
      objects.splice(index, 1);
      const x1 = edgeCase.x;
      const y1 = edgeCase.y;
      const width1 = edgeCase.width - TILE_SIZE;
      const height1 = TILE_SIZE;

      const x2 = x1 + width1;
      const y2 = y1;
      const deltaY = 832 - y1;
      const width2 = TILE_SIZE;
      const height2 = deltaY;

      const x3 = x1 + width1;
      const y3 = deltaY + y1;
      const width3 = TILE_SIZE;
      const height3 = edgeCase.height - deltaY;

      const rects = [
        makeShape({ x: x1, y: y1, width: width1, height: height1 }),
        makeShape({ x: x2, y: y2, width: width2, height: height2 }),
        makeShape({ x: x3, y: y3, width: width3, height: height3 }),
      ];

      objects.push(...rects);
    }

    return objects;
  };

  const layerName = 'Collision Layer';
  const objectLayerName = 'Collision Shapes';
  const layerNumber = COLLISION_LAYER;
  return makePolygonLayer({
    layers,
    layerName,
    layerNumber,
    objectLayerName,
    process,
    postProcess,
    optimizer: optimize(COLLISION_TYPE),
  });
};

/**
 * Makes a water layer rectangle shapes
 */
export const makeWaterLayer = ({ layers }) => {
  const process = (tile: Tile) => {
    if (tile && tile.isWater()) {
      const { graphic } = tile;
      return makeWater({ graphic, tile });
    }

    return null;
  };

  const layerName = 'Water Layer';
  const objectLayerName = 'Water Polygons';
  return makePolygonLayer({
    layers,
    layerName,
    objectLayerName,
    process,
    optimizer: optimizePolygons(WATER_TYPE)
  });
};

/**
 * Makes trigger layers polygon shapes
 */
export const makeTriggersLayer = ({ layers }) => {
  const process = (trigger: number) => (tile: Tile) => {
    if (tile && tile.trigger === trigger) {
      const { graphic } = tile;
      const meta = { trigger: tile.trigger };
      return makeTrigger({ graphic, tile, meta });
    }

    return null;
  };

  const postProcess = (trigger: number) => (objects: TmxObject[]) => (
    objects && objects.map((object: TmxObject) => {
      // const polygon = object.polygon.flatMap(p => [p.x, p.y]);
      // const shape = shapes.find(s => pointPolygon(s.x, s.y, polygon));
      // if (shape) setProperty(object, 'trigger', getProperty(shape, 'trigger'));
      createProperty(object, 'trigger', trigger);
      return object;
    })
  );

  const layerName = 'Trigger Layer';
  const objectLayerName = 'Trigger HitBoxes';
  const layerNumber = TRIGGER_LAYER;
  return range(0, TRIGGER_ROOF + 1).map(
    trigger => makePolygonLayer({
      layers,
      layerName,
      layerNumber,
      objectLayerName,
      optimizer: optimizePolygons(TRIGGER_TYPE),
      process: process(trigger),
      postProcess: postProcess(trigger),
    })
  );
};

/**
 * Makes an npc layer objects data
 */
export const makeNpcsLayer = ({ layers }) => {
  const process = (tile: Tile) => {
    if (tile && tile.npc) {
      const { graphic } = tile;
      const npc = makeNpc({
        graphic,
        tile: {
          ...tile,
          x: tile.npc.x,
          y: tile.npc.y
        } as Tile
      });

      createProperty(npc, 'npcId', tile.npc.id);
      return npc;
    }

    return null;
  };

  const layerName = 'Npcs Layer';
  const objectLayerName = 'Npcs Polygons';
  const layerNumber = NPC_LAYER;
  return makePolygonLayer({
    layers,
    layerName,
    layerNumber,
    objectLayerName,
    process,
  });
};

/**
 * Makes an objects layer data
 */
export const makeObjectsLayer = ({ layers }) => {
  const process = (tile: Tile) => {
    if (tile && tile.object) {
      const { graphic } = tile.object;
      const object = makeObject({
        graphic,
        tile: {
          ...tile,
          x: tile.object.x,
          y: tile.object.y,
        } as Tile
      });

      createProperty(object, 'type', tile.object.type);
      createProperty(object, 'objectId', tile.object.id);
      createProperty(object, 'amount', tile.object.amount);
      return object;
    }

    return null;
  };

  const layerName = 'Objects Layer';
  const objectLayerName = 'Objects Polygons';
  const layerNumber = OBJECT_LAYER;
  return makePolygonLayer({
    layers,
    layerName,
    layerNumber,
    objectLayerName,
    process,
  });
};

export interface ProcessLayerParameters {
  offset?: { x: number, y: number };
  resources: { [key: string]: LoaderResource };
  tileSets: TileSet[];
  tmx: Tiled;
}

/**
 * Handles layer parsing
 */
export const processLayer = ({
  offset = { x: 0, y: 0 },
  resources = {},
  tileSets = [],
  tmx,
}: ProcessLayerParameters) => (layer: Tile[][], index: number) => {
  const getId = (id: number) => parseFloat(Number(id).toFixed(2));
  const tileLayer = new TileLayer(tmx);
  const imageGroup = new GroupLayer();
  const objectLayer = new ObjectLayer();
  const groupLayer = new GroupLayer();
  const usedTileSets = [];
  const tilesData = [];
  const objects = [];
  const images = [];
  tileLayer.x = 0;
  tileLayer.y = 0;
  objectLayer.x = 0;
  objectLayer.y = 0;

  const [width, height] = TILED_MAP_SIZE;
  tileLayer.width = width;
  tileLayer.height = height;
  tileLayer.offsetx = offset && offset.x;
  tileLayer.offsety = offset && offset.y;
  groupLayer.name = `Layer ${getId(index) + 1}`;
  tileLayer.name = `Tile Layer ${getId(index) + 1}`;
  objectLayer.name = `Object Layer ${getId(index) + 1}`;
  tileLayer.id = ++lastId;
  groupLayer.id = ++lastId;
  objectLayer.id = ++lastId;

  for (let y = 0; y < TILED_MAP_SIZE[1]; y++) {
    for (let x = 0; x < TILED_MAP_SIZE[0]; x++) {
      const tile = layer[y][x];
      const tileIndex = y * TILED_MAP_SIZE[0] + x;
      tilesData[tileIndex] = 0;
      if (tile && tile.graphic) {
        const { graphic, animation } = tile;
        const data = findInTileSets({ graphic, tileSets, resources });
        tilesData[tileIndex] = 0;

        if (animation && (animation as Graphic).frames.length > 0) {
          const object = makeAnimation({ graphic: animation, tile, data });
          objects.push(object);
        }

        if (data) {
          const { frame, tileSet } = data;
          if (tile.layer > TILES_LAYER) {
            const object = makeSprite({ graphic, tile, data });
            const visible = frame.w > TILE_SIZE || frame.h > TILE_SIZE;
            const image = makeImageLayer({ frame, tile, tileSet, visible });
            objects.push(object);
            images.push(image);
          } else {
            const index = getTileIndex(frame.x, frame.y, ATLAS_COLUMNS);
            tilesData[tileIndex] = index + tileSet.firstgid;

            if (usedTileSets.indexOf(tileSet.imagePath) < 0) {
              usedTileSets.push(tileSet.imagePath);
            }
          }
        }
      }
    }
  }

  tileLayer.data = tilesData;
  createProperty(tileLayer, 'tileSets', usedTileSets.length);
  usedTileSets.forEach((t, id) => createProperty(tileLayer, `tileSet${id}`, t));

  const layerKey = `layerData`;
  const properties = {};
  properties[layerKey] = { gids: [], length: images.length, touch: Math.random() };

  let j = 1;
  while (images.length > 0) {
    const layer = images.shift();
    layer.name = `Sprite ${index + 1}.${j++}`;
    imageGroup.layers.push(layer);
    properties[layerKey].gids.push(layer.properties.gid);
  }

  imageGroup.name = `Sprites Layer ${index + 1}`;
  imageGroup.layers = imageGroup.layers.sort(ySortLayers);
  createProperty(imageGroup, layerKey, JSON.stringify(properties[layerKey]));

  objectLayer.objects = objects;
  groupLayer.layers = [tileLayer, objectLayer, imageGroup];
  return groupLayer;
};

export interface ConvertLayersToTmxParameters {
  crop: boolean;
  layers: Tile[][][];
  name: string;
  number: number;
  resources: { [key: string]: LoaderResource; };
}

/**
 * Convert Map Layers from JSON format to TMX
 */
export const convertLayersToTmx = ({
  crop = true,
  layers = [],
  name = 'Map',
  number = 1,
  resources = {},
}: ConvertLayersToTmxParameters) => {
  const tmx = new Tiled();
  const tileSets = [];
  objectId = 0;
  lastId = 0;

  range(1, TILESET_SPRITESHEETS + 1).forEach((s) => {
    const tileset = new TileSet();
    tileset.firstgid = (s - 1) * (ATLAS_COLUMNS * ATLAS_COLUMNS) + 1;
    tileset.spriteSheetSource = getSpriteSheetFilePath(s, config.tilesetsType);
    tileset.imagePath = getSpriteSheetImagePath(s, config.tilesetsType);
    tileset.source = getTileSetFilePath(s, config.tilesetsType);
    tileset.name = `Tile Set ${s}`;
    tileSets.push(tileset);
  });

  const [width, height] = TILED_MAP_SIZE;
  tmx.width = width;
  tmx.height = height;
  tmx.tilewidth = TILE_SIZE;
  tmx.tileheight = TILE_SIZE;
  tmx.tilesets = tileSets;
  tmx.name = `${name}${number}`;

  if (crop) {
    layers = layers.map(layer => (
      cropLayer({
        layer,
        x1: MAP_BORDER_X,
        y1: MAP_BORDER_Y,
        x2: TILED_MAP_SIZE[0],
        y2: TILED_MAP_SIZE[1]
      })
    ));
  }

  layers.forEach((l, i) => {
    const process = processLayer({ tmx, resources, tileSets });
    tmx.layers.push(process(l, i));
  });

  tmx.layers.push(makeWaterLayer({ layers }));
  tmx.layers.push(makeObjectsLayer({ layers }));
  tmx.layers.push(makeNpcsLayer({ layers }));
  tmx.layers.push(makeTileExitsLayer({ layers }));
  tmx.layers.push(...makeTriggersLayer({ layers }));
  tmx.layers.push(makeCollisionLayer({ layers }));
  return tmx;
};
