import range from 'lodash/fp/range';

import pack from 'ndarray-pack';
import contour from 'contour-2d';
import { pointPolygon } from 'intersects';
import decompose from 'rectangle-decomposition';

import { Texture } from 'pixi.js';
import config from '@mob/client/src/config';
import {
  ATLAS_COLUMNS,
  TILESET_SPRITESHEETS
} from '@mob/core/src/constants/game/Graphics';
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
} from '@mob/core/src/constants/game/Map';
import {
  createProperty,
  findInTileSets,
  getProperty,
  getTileIndex,
  setProperty,
  ySortLayers
} from '@mob/core/src/loaders/maps/tmx/util';
import {
  getSpriteSheetFilePath,
  getSpriteSheetImagePath,
  getTileSetFilePath
} from '@mob/core/src/loaders/spritesheets';
import { getGraphicsFileName } from '@mob/core/src/loaders/util';
import {
  Map,
  GroupLayer,
  ObjectLayer,
  TileSet,
  TileLayer,
  TmxObject,
  ImageLayer,
} from '@mob/core/src/models/data/map/Tiled';

let lastId = 0;
let objectId = 0;

/**
 * Fills an area of the map with the tiles that conform an object
 * of dimensions that are greater than TILE_SIZE
 * @param frame
 * @param tile
 * @param tilesData
 * @param tileSet
 * @returns {TileLayer|boolean}
 */
export const makeTileLayerFromSprite = ({ frame, tile, tilesData, tileSet }) => {
  const { graphic } = tile;
  const layerCreator = size => new Array(size).fill(0);
  const nearestWidth = Math.ceil(graphic.width / TILE_SIZE);
  const nearestHeight = Math.ceil(graphic.height / TILE_SIZE);
  const offset = { x: tile.offsetX, y: tile.offsetY };
  const cornerX = (tile.x * TILE_SIZE) - offset.x;
  const cornerY = (tile.y * TILE_SIZE) - offset.y;
  const buffer = [];

  const createLayer = () => {
    const layer = layerCreator(TILED_MAP_SIZE[1]).map(l => layerCreator(TILED_MAP_SIZE[0]));
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
 * @param frame
 * @param tile
 * @param tileSet
 * @param visible
 * @returns {ImageLayer}
 */
export const makeImageLayer = ({ frame, tile, tileSet, visible = true }) => {
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

/**
 * Constructs an object in TMX format
 * @param graphic
 * @param name
 * @param tile
 * @param data
 * @param type
 * @param [meta={}]
 * @returns {TmxObject}
 */
export const makeRect = ({ graphic, name = graphic.id, tile, data, type, meta = {} }) => {
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
      const fileName = graphic.frames.length > 0 ? graphic.frames[0].fileName : graphic.fileName;
      const fullFileName = getGraphicsFileName(fileName);
      const texture = Texture.fromImage(fullFileName);
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

export const makeAnimation = ({ type = ANIMATION_TYPE, ...props }) => makeRect({ ...props, type });
export const makeWater = ({ type = WATER_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeCollision = ({ type = COLLISION_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeTileExit = ({ type = TILE_EXIT_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeTrigger = ({ type = TRIGGER_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeObject = ({ type = OBJECT_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeNpc = ({ type = NPC_TYPE, ...props }) => makeRect({ ...props, type, name: '' });
export const makeSprite = ({ type = SPRITE_TYPE, ...props }) => makeRect({ ...props, type });

/**
 * Makes a collision HitBox object from rect parameters
 * @param object
 * @param x
 * @param y
 * @param width
 * @param height
 * @param type
 * @returns {TmxObject}
 */
export const makeShape = ({ x, y, width, height, type = COLLISION_TYPE, ...extra }) => {
  const object = new TmxObject();
  object.id = ++objectId;
  object.type = type;
  object.x = x;
  object.y = y;
  object.width = width;
  object.height = height;

  if (extra.polygon) {
    object.polygon = extra.polygon;
  }

  return object;
};

/**
 * Crops a map layer using x1, y1, x2, y2
 * @param layer
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {Array.<Tile>}
 */
export const cropLayer = (layer, x1, y1, x2, y2) => {
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
 * @param {string} type
 * @returns {function(list : Array.<TmxObject>) : Array.<TmxObject>}
 */
const optimize = (type = COLLISION_TYPE) => (list) => {
  const bitmap = range(0, TILED_MAP_SIZE[1]).map(y => range(0, TILED_MAP_SIZE[0]).map(x => 0));
  list.forEach(c => bitmap[Math.floor(c.y / TILE_SIZE)][Math.floor(c.x / TILE_SIZE)] = 1);
  const paths = contour(pack(bitmap), true);
  const optimized = decompose(paths, false);
  const polygons = [];
  const objects = [];

  optimized.forEach((rows) => {
    const polygon = rows.map(vertex => ({ x: vertex[0], y: vertex[1] }));
    polygons.push(polygon);

    const [p1, p2] = polygon;
    const x = p1.x * TILE_SIZE;
    const y = p1.y * TILE_SIZE;
    const width = (p2.x - p1.x) * TILE_SIZE;
    const height = (p2.y - p1.y) * TILE_SIZE;
    const object = makeShape({ type, x, y, width, height });
    objects.push(object);
  });

  return objects;
};

/**
 * Converts a list of TmxObject's into a list of polygonal areas
 * using contour2D
 *
 * @param {string} type
 * @returns {function(list : Array.<TmxObject>) : Array.<TmxObject>}
 */
const optimizePolygons = (type = COLLISION_TYPE) => (list) => {
  const bitmap = range(0, TILED_MAP_SIZE[1]).map(y => range(0, TILED_MAP_SIZE[0]).map(x => 0));
  list.forEach(c => bitmap[Math.floor(c.y / TILE_SIZE)][Math.floor(c.x / TILE_SIZE)] = 1);
  const paths = contour(pack(bitmap), true);
  const polygons = [];
  const objects = [];

  paths.forEach((rows) => {
    const polygon = rows.map(vertex => ({ x: vertex[0] * TILE_SIZE, y: vertex[1] * TILE_SIZE }));
    polygons.push(polygon);

    // const offsetX = x - Math.floor((x - TILE_SIZE) / TILE_SIZE);
    // x -= offsetX; grid alignment - not needed
    const object = makeShape({ type, polygon });
    objects.push(object);
  });

  return objects;
};

/**
 * Traverses all tiles from a map and creates a polygon layer
 * using optimizer and process functions
 * @param layers
 * @param layerName
 * @param objectLayerName
 * @param layerNumber
 * @param process
 * @param optimizer
 * @param post
 * @returns {GroupLayer}
 */
export const makePolygonLayer = ({
  layers,
  layerName,
  objectLayerName,
  layerNumber = TILES_LAYER,
  process = () => {},
  postProcess = null,
  optimizer = i => i,
}) => {
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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeTileExitsLayer = ({ layers }) => {
  const process = (tile) => {
    if (tile && tile.tileExit) {
      const { graphic } = tile;
      const meta = { mapNumber: tile.tileExit.map };
      return makeTileExit({ graphic, tile, meta });
    }

    return null;
  };

  const postProcess = (objects, shapes) => objects && objects.map((c) => {
    let tmxObject = null;

    // take neighboring tiles if available
    if (c.x + TILE_SIZE < c.width) {
      tmxObject = shapes.find(t => t.x === c.x + TILE_SIZE && t.y === c.y);
    } else if (c.y + TILE_SIZE < c.height) {
      tmxObject = shapes.find(t => t.x === c.x && t.y === c.y + TILE_SIZE);
    } else {
      tmxObject = shapes.find(t => t.x === c.x && t.y === c.y);
    }

    const mapNumber = getProperty(tmxObject, 'mapNumber');
    createProperty(c, 'mapNumber', mapNumber);
    return c;
  });

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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeCollisionLayer = ({ layers }) => {
  const process = (tile) => {
    if (tile && (tile.blocked || tile.isWater())) {
      const { graphic } = tile;
      return makeCollision({ graphic, tile });
    }

    return null;
  };

  // fixes weird contour2d edge case failing for ULLA
  const postProcess = (objects, shapes) => {
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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeWaterLayer = ({ layers }) => {
  const process = (tile) => {
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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeTriggersLayer = ({ layers }) => {
  const process = trigger => (tile) => {
    if (tile && tile.trigger === trigger) {
      const { graphic } = tile;
      const meta = { trigger: tile.trigger };
      return makeTrigger({ graphic, tile, meta });
    }

    return null;
  };

  const postProcess = trigger => (objects, shapes) => objects && objects.map((object) => {
    // const polygon = object.polygon.flatMap(p => [p.x, p.y]);
    // const shape = shapes.find(s => pointPolygon(s.x, s.y, polygon));
    // if (shape) setProperty(object, 'trigger', getProperty(shape, 'trigger'));
    createProperty(object, 'trigger', trigger);
    return object;
  });

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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeNpcsLayer = ({ layers }) => {
  const process = (tile) => {
    if (tile && tile.npc) {
      const { graphic } = tile;
      const npc = makeNpc({ graphic, tile: { ...tile, x: tile.npc.x, y: tile.npc.y } });
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
 * @param layers
 * @returns {GroupLayer}
 */
export const makeObjectsLayer = ({ layers }) => {
  const process = (tile) => {
    if (tile && tile.object) {
      const { graphic } = tile.object;
      const object = makeObject({
        graphic,
        tile: {
          ...tile,
          x: tile.object.x,
          y: tile.object.y,
        }
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

/**
 * Handles layer parsing
 * @param resources
 * @param tileSets
 * @param offset
 * @returns {function(layer, index): GroupLayer}
 */
export const processLayer = ({
  resources = {},
  tileSets = [],
  offset = { x: 0, y: 0 },
}) => (l, i) => {
  const getId = id => parseFloat(Number(id).toFixed(2));
  const tileLayer = new TileLayer();
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
  groupLayer.name = `Layer ${getId(i) + 1}`;
  tileLayer.name = `Tile Layer ${getId(i) + 1}`;
  objectLayer.name = `Object Layer ${getId(i) + 1}`;
  tileLayer.id = ++lastId;
  groupLayer.id = ++lastId;
  objectLayer.id = ++lastId;

  for (let y = 0; y < TILED_MAP_SIZE[1]; y++) {
    for (let x = 0; x < TILED_MAP_SIZE[0]; x++) {
      const tile = l[y][x];
      const tileIndex = y * TILED_MAP_SIZE[0] + x;
      tilesData[tileIndex] = 0;
      if (tile && tile.graphic) {
        const { graphic, animation } = tile;
        const data = findInTileSets({ graphic, tileSets, resources });
        tilesData[tileIndex] = 0;

        if (animation && animation.frames.length > 0) {
          if (!tile.isWater()) {
            const object = makeAnimation({ graphic: animation, tile, data });
            objects.push(object);
          }
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
    layer.name = `Sprite ${i + 1}.${j++}`;
    imageGroup.layers.push(layer);
    properties[layerKey].gids.push(layer.properties.gid);
  }

  imageGroup.name = `Sprites Layer ${i + 1}`;
  imageGroup.layers = imageGroup.layers.sort(ySortLayers);
  createProperty(imageGroup, layerKey, JSON.stringify(properties[layerKey]));

  objectLayer.objects = objects;
  groupLayer.layers = [tileLayer, objectLayer, imageGroup];
  return groupLayer;
};

/**
 * Convert Map Layers from JSON format to TMX
 * @param layers
 * @param resources
 * @param name
 * @param number
 * @param [crop=true]
 * @returns {Map}
 */
export const convertLayersToTmx = ({
  layers = [],
  resources = {},
  number = 1,
  crop = true,
  name = 'Map'
}) => {
  const tmx = new Map();
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
    layers = layers.map(l => cropLayer(l, MAP_BORDER_X, MAP_BORDER_Y, TILED_MAP_SIZE[0], TILED_MAP_SIZE[1]));
  }

  layers.forEach((l, i) => {
    const process = processLayer({ resources, tileSets, lastId, objectId });
    tmx.layers.push(process(l, i));
  });

  tmx.layers.push(makeWaterLayer({ layers }));
  tmx.layers.push(makeObjectsLayer({ layers }));
  tmx.layers.push(makeNpcsLayer({ layers }));
  tmx.layers.push(makeTileExitsLayer({ layers }));
  tmx.layers.push(...makeTriggersLayer({ layers }));
  tmx.layers.push(makeCollisionLayer({ layers }));
  tmx.nextlayerid = ++lastId;
  tmx.nextobjectid = ++objectId;
  return tmx;
};

export default null;
