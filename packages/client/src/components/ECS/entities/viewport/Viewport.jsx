import { Container, withPixiApp } from '@inlet/react-pixi';
import Ease from 'pixi-ease';
import React from 'react';

import head from 'lodash/fp/head';

import { randomRange } from 'client/utils';
import { canvasWidth, canvasHeight } from 'core/constants/game/App';
import MapComponent from 'ecs/components/map/MapComponent';
import Controllable from 'ecs/components/character/Controllable';
import OnPhysicsUpdate from 'ecs/components/physics/OnPhysicsUpdate';
import OnCameraUpdate from 'ecs/components/viewport/OnCameraUpdate';
import Camera from 'ecs/components/viewport/Camera';
import Water from 'ecs/entities/map/water/Water';
import { ON_PHYSICS_UPDATE } from 'ecs/entities/physics/Scene';
import Entity from 'ecs/Entity';
import { withWorld } from 'ecs/World';
import { TILE_SIZE } from 'core/constants/game/Map';

export const ON_CAMERA_UPDATE = 'on camera update';
export const ViewportFamily = [OnPhysicsUpdate, Camera];

class Viewport extends Entity {
  constructor(props) {
    super(props);
    this.state.accumulatorX = 0;
    this.state.accumulatorY = 0;

    this.addListener(ON_PHYSICS_UPDATE, this.onPhysicsUpdate);
    this.addListener(ON_CAMERA_UPDATE, this.updateCamera);
    this.container = React.createRef();
    this.waterLayer = React.createRef();

    this.ease = new Ease.list();
  }

  componentDidMount() {
    this.props.app.ticker.add(this.update, this);
    this.updateCamera();
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.update);
  }

  updateCamera() {
    const { entity } = this;
    const { world } = this.props;
    entity.camera.projection.width = canvasWidth;
    entity.camera.projection.height = canvasHeight;

    const candidates = world.queryComponents([OnCameraUpdate]);
    candidates.forEach(c => c.emit(ON_CAMERA_UPDATE, entity.camera.projection));
  }

  onPhysicsUpdate(delta, alpha) {
    const { entity } = this;
    const { world } = this.props;
    const { position, projection: camera } = entity.camera;
    const oldCameraX = camera.x;
    const oldCameraY = camera.y;

    if (this.player) {
      const { velocity, position: playerPosition } = this.player.physic.body;
      const targetX = playerPosition.x - (camera.width / 2);
      const targetY = playerPosition.y - (camera.height / 2);
      // this.ease.to(camera, { x: targetX, y: targetY }, delta);
      camera.x = targetX;
      camera.y = targetY;

      // position.x = playerPosition.x;
      // position.y = playerPosition.y;
      this.state.accumulatorX += velocity.x;
      this.state.accumulatorY += velocity.y;
    }

    if (this.props.boundsLock) {
      if (camera.x + camera.width >= this.tmx.width * TILE_SIZE || camera.x <= 0) {
        camera.x = oldCameraX;
        this.directionX = -this.directionX;
      }

      if (camera.y + camera.height >= this.tmx.height * TILE_SIZE || camera.y <= 0) {
        camera.y = oldCameraY;
        this.directionY = -this.directionY;
      }
    }
  }

  update(delta) {
    const { entity } = this;
    const { world, width, height } = this.props;
    const { projection: camera } = entity.camera;

    if (!this.map) this.map = head(world.queryComponents([MapComponent]));
    if (!this.player) this.player = head(world.queryComponents([Controllable]));
    if (!this.masks && this.map) this.masks = this.map.mapComponent.masks;
    if (!this.tmx && this.map) this.tmx = this.map.mapComponent.tmx;

    if (
      Math.abs(this.state.accumulatorX) >= TILE_SIZE * 2 ||
      Math.abs(this.state.accumulatorY) >= TILE_SIZE * 2
    ) {
      this.state.accumulatorX = 0;
      this.state.accumulatorY = 0;
      this.updateCamera();
    }

    this.container.current.position.x = -camera.x;
    this.container.current.position.y = -camera.y;

    if (this.waterLayer.current) {
      this.waterLayer.current.width = canvasWidth;
      this.waterLayer.current.height = canvasHeight;
      this.waterLayer.current.camera = camera;
      this.waterLayer.current.update(delta);
    }
  }

  render() {
    return (
      <Container ref={this.container}>
        <Water ref={this.waterLayer} />
        {this.props.children}
      </Container>
    );
  }
}

export default withWorld(withPixiApp(Viewport));
