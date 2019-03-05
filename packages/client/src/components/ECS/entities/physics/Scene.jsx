import { Container, withPixiApp } from '@inlet/react-pixi';
import { Scene as BumpScene } from '@lcluber/bumpjs';
import { boxBox } from 'intersects';
import React from 'react';
import { Point, Rectangle } from 'pixi.js';

import head from 'lodash/fp/head';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';

import { PRELOAD, TILE_SIZE } from 'core/constants/game/Map';
import { canvasHeight, canvasWidth } from 'core/constants/game/App';
import { getProperty } from 'core/loaders/maps/tmx/util';
import { calculateProjectionMatrix } from 'core/util/viewport';

import PhysicsScene from 'ecs/components/physics/PhysicsScene';
import OnPhysicsUpdate from 'ecs/components/physics/OnPhysicsUpdate';
import OnCameraUpdate from 'ecs/components/viewport/OnCameraUpdate';
import { TiledMapFamily } from 'ecs/entities/map/TiledMap';
import { ON_CAMERA_UPDATE } from 'ecs/entities/viewport/Viewport';
import Entity from 'ecs/Entity';
import { withWorld } from 'ecs/World';

export const ADD_BODY = 'add body';
export const REMOVE_BODY = 'remove body';
export const ON_PHYSICS_UPDATE = 'on physics update';
export const DEFAULT_ITERATIONS = 1;
export const FIXED_STEP = 1 / 18;
export const MAX_DELTA = 1 / 4;
export const DELTA = 1 / 100;

export const SceneFamily = [PhysicsScene, OnCameraUpdate];
class Scene extends Entity {
  constructor(props) {
    super(props);
    this.staticScene = new BumpScene();
    this.dynamicScene = new BumpScene();
    this.staticScene.setIteration(props.iterations || DEFAULT_ITERATIONS);
    this.dynamicScene.setIteration(props.iterations || DEFAULT_ITERATIONS);

    this.addListener(ADD_BODY, this.addBody);
    this.addListener(REMOVE_BODY, this.removeBody);
    this.addListener(ON_CAMERA_UPDATE, this.onCameraUpdate);

    this.staticIdsCache = [];
    this.staticCache = [];
    this.dynamicCache = [];
    this.static = [];
    this.dynamic = [];
    this.preload = PRELOAD * TILE_SIZE;
    this.state.bounds = new Rectangle();
    this.state.chunk = new Point();
    this.camera = new Rectangle();
    this.container = React.createRef();
    this.accumulator = 0.0;
    this.previous = 0.0;
    this.current = 0.0;
  }

  componentDidMount() {
    this.props.app.ticker.add(this.update, this);
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.update);
  }

  generateCache(collisions, collisionsCache) {
    const [width, height] = [canvasWidth, canvasHeight];
    const { mapComponent: { tmx } } = this.map;
    for (let y = 0; y < tmx.height; y++) {
      for (let x = 0; x < tmx.width; x++) {
        const screenX = x * TILE_SIZE;
        const screenY = y * TILE_SIZE;
        const chunk = { x, y };
        const camera = { x: screenX, y: screenY, width, height };
        const bounds = calculateProjectionMatrix(tmx, camera, this.preload);
        this.getCollisionsInViewport(collisions, collisionsCache, chunk, bounds);
      }
    }
  }

  generateCollisionIdsCache(collisions, cache) {
    const collisionsCache = flow(
      map(object => cache[collisions.indexOf(object)] = object)
    );

    return collisionsCache(collisions);
  }

  getCollisionsInViewport(collisions, cache, chunk, bounds) {
    const { mapComponent: { tmx } } = this.map;
    const memoKey = chunk.y * tmx.width + chunk.x;

    if (!cache[memoKey]) {
      const getCollisions = flow(
        filter((object) => {
          const rect1 = [
            object.body.position.x,
            object.body.position.y,
            object.body.size.x,
            object.body.size.y,
          ];
          const rect2 = [
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
          ];
          return boxBox(...rect1, ...rect2);
        }),
        map(o => collisions.indexOf(o)),
      );
      cache[memoKey] = getCollisions(collisions);
    }

    return cache[memoKey];
  }

  addBody(body, dynamic = false) {
    if (dynamic) {
      this.dynamic.push(body);
      this.dynamicScene.addBody(body);
      return this;
    }

    this.staticScene.addBody(body);
    return this;
  }

  removeBody(body) {
    const dynamicIndex = this.dynamic.indexOf(body);
    const staticIndex = this.static.indexOf(body);

    if (dynamicIndex > -1) {
      this.dynamic.splice(dynamicIndex, 1);
      this.dynamicScene.removeBody(body);
    }

    if (staticIndex > -1) {
      this.static.splice(staticIndex, 1);
      this.static.removeBody(body);
    }
  }

  onCameraUpdate(camera) {
    if (this.map && this.map.mapComponent) {
      const { mapComponent: { tmx } } = this.map;
      this.state.chunk.x = Math.floor(camera.x / TILE_SIZE);
      this.state.chunk.y = Math.floor(camera.y / TILE_SIZE);
      this.state.bounds = calculateProjectionMatrix(tmx, camera, this.preload);
      this.camera = camera;

      const collisions = this.getCollisionsInViewport(
        this.static,
        this.staticCache,
        this.state.chunk,
        this.state.bounds
      ).map(i => this.staticIdsCache[i]);
      this.updateStaticBodies(collisions);
    }
  }

  updateStaticBodies(collisions) {
    this.static = collisions;
    return this.updateBodies(this.staticScene, collisions);
  }

  updateDynamicBodies(collisions) {
    this.dynamic = collisions;
    return this.updateBodies(this.dynamicScene, collisions);
  }

  updateBodies(scene, collisions) {
    scene.bodies = collisions;
    scene.bodiesLength = collisions.length;
  }

  getCollisionsFromMap(world) {
    if (!this.static.length) {
      this.map = head(world.queryComponents(TiledMapFamily));

      if (this.map.mapComponent) {
        this.static = this.map.mapComponent.collisions;
        this.generateCollisionIdsCache(this.static, this.staticIdsCache);
        this.generateCache(this.static, this.staticCache);
        this.onCameraUpdate(this.camera);
      }
    }
  }

  update(delta) {
    const { world } = this.props;
    this.getCollisionsFromMap(world);
    const candidates = world.queryComponents([OnPhysicsUpdate]);

    if (this.accumulator < FIXED_STEP) return this.accumulator += delta;
    if (delta >= MAX_DELTA) delta = MAX_DELTA;
    // this.accumulator += delta;

    while (this.accumulator >= FIXED_STEP) {
      this.dynamic.forEach(b => b.updatePosition(FIXED_STEP));
      this.accumulator -= delta;
    }

    this.dynamicScene.testScene(this.staticScene);
    this.dynamicScene.test();

    // console.log(this.accumulator / delta);
    const alpha = this.accumulator / delta;
    candidates.forEach(c => c.emit(ON_PHYSICS_UPDATE, DELTA, alpha));
    return null;
  }

  render() {
    return (
      <Container ref={this.container} />
    );
  }
}

export default withWorld(withPixiApp(Scene));
