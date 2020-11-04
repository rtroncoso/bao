import { Container, withPixiApp } from '@inlet/react-pixi';
import { boxPolygon } from 'intersects';
import { extras, Point, Rectangle, Sprite, Texture } from 'pixi.js';
import EASE from 'pixi-ease';
import React from 'react';

import each from 'lodash/fp/each';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import range from 'lodash/fp/range';

import { polygon } from 'client/utils';
import Layers from 'ecs/components/map/Layers';
import MapComponent from 'ecs/components/map/MapComponent';
import PhysicsScene from 'ecs/components/physics/PhysicsScene';
import OnCameraUpdate from 'ecs/components/viewport/OnCameraUpdate';
import { ADD_BODY, REMOVE_BODY } from 'ecs/entities/physics/Scene';
import { ON_CAMERA_UPDATE } from 'ecs/entities/viewport/Viewport';
import Entity from 'ecs/Entity';
import { withWorld } from 'ecs/World';
import { canvasHeight, canvasWidth } from 'core/constants/game/App';
import {
  CHARACTER_TYPE,
  ENTITIES_LAYER,
  MAP_LAYERS,
  PRELOAD,
  TILE_SIZE, TRIGGER_ROOF, UPPER_LAYER,
} from 'core/constants/game/Map';
import {
  getCollisionsFromObjectLayers,
  getObjectLayersFromTmx,
  getObjectsFromObjectLayers,
  getSpritesFromObjectLayers,
  getTileLayersFromTmx,
  getTriggersFromObjectLayers,
  getWaterFromObjectLayers
} from 'core/loaders/maps/tmx/getters';
import { getProperty } from 'core/loaders/maps/tmx/util';
import { getTexture } from 'core/loaders/graphics';
import { getTileSetTextures } from 'core/loaders/spritesheets';
import { calculateProjectionMatrix } from 'core/util/viewport';

import 'pixi-layers';
import 'pixi-tilemap';
const { display, tilemap } = window.PIXI;

export const SET_TRIGGER = 'set trigger';
const easing = new EASE.list();

export const ANIMATIONS_POOL_SIZE = 2000;
export const SPRITES_POOL_SIZE = 3000;
export const TiledMapFamily = [Layers, MapComponent, OnCameraUpdate];
class TiledMap extends Entity {
  constructor(props) {
    super(props);

    this.entity.getTriggerFromLayer = this.getTriggerFromLayer.bind(this);
    this.entity.getTrigger = this.getTrigger.bind(this);
    this.entity.hasTrigger = this.hasTrigger.bind(this);
    this.addListener(ON_CAMERA_UPDATE, this.onCameraUpdate);
    this.addListener(SET_TRIGGER, this.setTrigger);
    const { mapComponent } = this.entity;
    mapComponent.number = props.number;
    mapComponent.tmx = props.tmx;
    const { tmx } = mapComponent;

    this.state.bounds = new Rectangle();
    this.state.chunk = new Point();

    this.animations = [];
    this.spritesPool = [];
    this.animationsPool = [];
    this.objectIdsCache = [];
    this.spriteIdsCache = [];
    this.objectsCache = {};
    this.spritesCache = {};
    this.generatePool();

    this.container = React.createRef();
    this.tilesLayer = React.createRef();
    this.spritesLayer = React.createRef();
    this.objectsLayer = React.createRef();

    this.preload = PRELOAD * TILE_SIZE;
    this.textures = getTileSetTextures(this.props.resources, this.props.graphics);
    this.tileLayers = getTileLayersFromTmx(tmx);
    this.objectLayers = getObjectLayersFromTmx(tmx);
    this.sprites = getSpritesFromObjectLayers(this.objectLayers);
    this.objects = getObjectsFromObjectLayers(this.objectLayers);
    this.water = getWaterFromObjectLayers(this.objectLayers);
    this.collisions = getCollisionsFromObjectLayers(this.objectLayers);
    this.triggers = getTriggersFromObjectLayers(this.objectLayers);

    this.entity.mapComponent.collisions = this.collisions;
    this.entity.mapComponent.objects = this.objects;
    this.entity.mapComponent.triggers = this.triggers;
    this.entity.mapComponent.masks = this.water.map(l => l.polygon);
    console.log(this.entity.mapComponent.masks);
    this.entity.layers.groups = this.createLayerGroups();
  }

  createLayerGroups() {
    const layers = {};
    range(0, MAP_LAYERS + 1).forEach(l => layers[l] = new display.Group(l, true));
    layers[ENTITIES_LAYER].on('sort', this.sort);
    return layers;
  }

  sort(sprite) {
    if (sprite.type && sprite.type === CHARACTER_TYPE) {
      return sprite.zOrder = (sprite.y + TILE_SIZE) * -1;
    }

    return sprite.zOrder = (sprite.y + sprite.height) * -1;
  }

  componentDidMount() {
    this.props.app.ticker.add(this.update, this);
    this.generateObjectIdsCache(this.sprites, this.spritesCache);
    this.generateObjectIdsCache(this.objects, this.objectsCache);
    this.generateCache(this.sprites, this.objects, this.spriteIdsCache, this.objectIdsCache);

    if (this.collisions) {
      const { world } = this.props;
      const scene = world.queryComponents([PhysicsScene])[0];
      this.collisions.forEach(c => scene.emit(ADD_BODY, c));
    }
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.update);
    this.tilesLayer.current = null;
    this.spritesLayer.current = null;
    this.spritesCache = null;
    this.objectsCache = null;
    this.spriteIdsCache = null;
    this.objectIdsCache = null;
    this.spritesPool = null;
    this.animationsPool = null;

    if (this.collisions) {
      const { world } = this.props;
      const scene = world.queryComponents([PhysicsScene])[0];
      this.collisions.forEach(c => scene.emit(REMOVE_BODY, c));
    }
  }

  onCameraUpdate(camera) {
    const { mapComponent: { tmx } } = this.entity;

    this.state.chunk.x = Math.floor(camera.x / TILE_SIZE);
    this.state.chunk.y = Math.floor(camera.y / TILE_SIZE);
    this.state.bounds = calculateProjectionMatrix(tmx, camera, this.preload);

    const sprites = this.getObjectsInViewport(this.sprites, this.spriteIdsCache, this.state.chunk, this.state.bounds);
    const objects = this.getObjectsInViewport(this.objects, this.objectIdsCache, this.state.chunk, this.state.bounds);
    const tiles = this.generateTileLayers(this.tileLayers, this.state.bounds);

    this.renderToTarget(tiles, this.tilesLayer);
    this.renderSpriteLayers(sprites, this.spritesLayer);
    this.renderObjectLayers(objects, this.objectsLayer);
  }

  generatePool() {
    range(0, SPRITES_POOL_SIZE).forEach(
      index => this.spritesPool[index] = new Sprite(Texture.EMPTY)
    );
    range(0, ANIMATIONS_POOL_SIZE).forEach(
      index => this.animationsPool[index] = new extras.AnimatedSprite([Texture.EMPTY])
    );
  }

  generateCache(sprites, objects, spritesCache, objectsCache) {
    const [width, height] = [canvasWidth, canvasHeight];
    const { mapComponent: { tmx } } = this.entity;
    for (let y = 0; y < tmx.height; y++) {
      for (let x = 0; x < tmx.width; x++) {
        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;
        const chunk = { x, y };
        const camera = { x: screenX, y: screenY, width, height };
        const bounds = calculateProjectionMatrix(tmx, camera, this.preload);
        this.getObjectsInViewport(sprites, spritesCache, chunk, bounds);
        this.getObjectsInViewport(objects, objectsCache, chunk, bounds);
      }
    }
  }

  generateObjectIdsCache(objects, cache) {
    const objectsCache = flow(
      map(object => cache[object.id] = this.getSpriteFromObject(object))
    );

    return objectsCache(objects);
  }

  getTileLayersInViewport(layers, cache, chunk, bounds) {
    const { mapComponent: { tmx } } = this.entity;
    const memoKey = chunk.y * tmx.width + chunk.x;

    if (!cache[memoKey]) {
      cache[memoKey] = this.generateTileLayers(layers, bounds);
    }

    return cache[memoKey];
  }

  getObjectsInViewport(objects, cache, chunk, bounds) {
    const { mapComponent: { tmx } } = this.entity;
    const memoKey = chunk.y * tmx.width + chunk.x;

    if (!cache[memoKey]) {
      const grabSprites = flow(
        filter(object => bounds.contains(object.x, object.y)),
        groupBy(object => getProperty(object, 'layer')),
        mapValues(layer => layer.map(o => o.id)),
      );
      cache[memoKey] = grabSprites(objects);
    }

    return cache[memoKey];
  }

  getSpriteFromPoolOrNew(graphic) {
    if (graphic.frames.length > 0) {
      const sprite = this.animationsPool.pop() || new extras.AnimatedSprite([Texture.EMPTY]);
      sprite.remove = () => this.animationsPool.push(sprite);
      sprite.textures = graphic.frames.map(getTexture);
      sprite.animationSpeed = graphic.speed / 4;
      this.animations.push(sprite);
      sprite.gotoAndPlay(0);
      return sprite;
    }

    const sprite = this.spritesPool.pop() || new Sprite(Texture.EMPTY);
    sprite.remove = () => this.spritesPool.push(sprite);
    sprite.texture = getTexture(graphic);
    return sprite;
  }

  getSpriteFromObject(layer) {
    const x = getProperty(layer, 'x');
    const y = getProperty(layer, 'y');
    const layerNumber = getProperty(layer, 'layer');
    const graphicId = getProperty(layer, 'graphicId');

    const graphic = this.props.graphics[graphicId];
    const sprite = this.getSpriteFromPoolOrNew(graphic);
    sprite.position.set(x, y);
    sprite.layer = layerNumber;
    sprite.type = layer.type;
    return sprite;
  }

  generateTileLayers(layers, bounds) {
    const screenBoundsX = Math.floor(bounds.x / TILE_SIZE);
    const screenBoundsY = Math.floor(bounds.y / TILE_SIZE);
    const screenBoundsWidth = Math.floor(bounds.width / TILE_SIZE);
    const screenBoundsHeight = Math.floor(bounds.height / TILE_SIZE);
    const { mapComponent: { tmx } } = this.entity;

    return layers.map((l, i) => {
      const tileSets = getProperty(l, 'usedTileSets');
      const layer = new tilemap.CompositeRectTileLayer(i, tileSets, true);
      for (let y = screenBoundsY; y < screenBoundsHeight; y++) {
        for (let x = screenBoundsX; x < screenBoundsWidth; x++) {
          const index = y * tmx.width + x;
          if (l.data[index] > 0) {
            const texture = this.textures[l.data[index]];
            layer.addFrame(texture, x * TILE_SIZE, y * TILE_SIZE);
          }
        }
      }
      return layer;
    });
  }

  getTrigger() {
    return this.trigger;
  }

  getTriggerFromLayer(trigger) {
    return trigger ? getProperty(trigger, 'trigger') : null;
  }

  hasTrigger(trigger) {
    const number = this.getTriggerFromLayer(trigger);
    return number ? this.trigger === number : false;
  }

  setTrigger(trigger) {
    this.trigger = this.getTriggerFromLayer(trigger);
    this.handleTrigger(trigger);
  }

  handleTrigger(trigger) {
    const number = this.getTriggerFromLayer(trigger);
    const hideRoofs = flow(
      filter(sprite => sprite.layer === UPPER_LAYER),
      filter(sprite => boxPolygon(
        sprite.position.x,
        sprite.position.y,
        sprite.width,
        sprite.height,
        polygon(trigger.polygon),
        0.1
      )),
      each(sprite => easing.to(sprite, { alpha: 0.0 }, 500))
    );
    const showRoofs = flow(
      filter(sprite => sprite.layer === UPPER_LAYER),
      each(sprite => easing.to(sprite, { alpha: 1.0 }, 500)),
    );

    switch (number) {
    case TRIGGER_ROOF:
      hideRoofs(this.spritesLayer.current.children);
      break;
    default:
      showRoofs(this.spritesLayer.current.children);
      break;
    }
  }

  update(delta) {
    this.animations.forEach(a => a && a.update(delta));
  }

  renderObjectLayers(layers, target, cache = this.objectsCache) {
    this.renderSpriteLayers(layers, target, cache);
  }

  renderSpriteLayers(layers, target, cache = this.spritesCache) {
    const spritesRenderer = each((layer) => {
      const action = (id) => {
        const sprite = cache[id];
        const group = this.entity.layers.groups[sprite.layer];
        if (group) sprite.parentGroup = group;
        return sprite;
      };

      this.renderToTarget(layer, target, action, false);
    });

    if (target.current) target.current.removeChildren();
    return spritesRenderer(Object.values(layers));
  }

  renderToTarget(layers, target, action = i => i, remove = true) {
    if (target.current) {
      const container = target.current;
      if (remove) target.current.removeChildren();
      layers.forEach(layer => layer && container.addChild(action.call(this, layer)));
    }

    return layers;
  }

  render() {
    return (
      <Container ref={this.container}>
        <Container ref={this.tilesLayer} />
        <Container ref={this.spritesLayer} />
        <Container ref={this.objectsLayer} />
      </Container>
    );
  }
}

export default withWorld(withPixiApp(TiledMap));
