import { Graphics, Sprite, withPixiApp } from '@inlet/react-pixi';
import { Point, Rectangle, Texture } from 'pixi.js';
import React from 'react';

import Layers from 'ecs/components/map/Layers';
import { withWorld } from 'ecs/World';
import Entity from 'ecs/Entity';

import WaterShader from 'client/filters/water/water';
import { WATER_LAYER } from 'core/constants/game/Map';

import texture from './water.png';
import normal from './water_normal.png';
import displacement from './water_uv_displacement.png';

const { PIXI } = window;

class Water extends Entity {
  constructor(props) {
    super(props);
    this.water = React.createRef();
    this.shape = React.createRef();

    this.screen = new Rectangle();
    this.texture = Texture.fromImage(texture);
    this.normal = Texture.fromImage(normal);
    this.displacement = Texture.fromImage(displacement);
    this.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    this.normal.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    this.displacement.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

    this.state.shader = new WaterShader({
      normal: this.normal,
      displacement: this.displacement
    });
  }

  componentDidUpdate() { 
    if (this.shape.current && this.props.masks !== this.state.masks) {
      this.state.masks = this.props.masks;
      this.state.mask = this.buildMask(this.props.masks || []);
    }
  }

  buildMask(shapes) {
    const g = this.shape.current;

    shapes.forEach(shape => {
      const path = shape.map((s) => new Point(s.x, s.y));
      g.lineStyle(5, 0xffffff, 0.4);
      g.beginFill(0xff0000, 0.1);
      g.drawPolygon(path);
      g.closePath();
      g.endFill();
    });

    return g;
  }

  update(delta) {
    if (!this.group) {
      const { world } = this.props;
      const { layers } = world.queryComponents([Layers])[0];
      this.group = layers.groups[WATER_LAYER];
      this.water.current.parentGroup = this.group;
    }

    this.screen.width = this.width;
    this.screen.height = this.height;
    this.water.current.width = this.camera.width;
    this.water.current.height = this.camera.height;
    this.water.current.position.x = this.camera.x;
    this.water.current.position.y = this.camera.y;
    this.state.shader.update(delta, this.camera);
  }

  render() {
    const { shader } = this.state;
    return (
      <React.Fragment>
        <Sprite
          ref={this.water}
          texture={this.texture}
          // mask={this.state.mask}
          filters={[shader]}
        />
        <Graphics
          ref={this.shape}
        />
      </React.Fragment>
    );
  }
}

export default withWorld(withPixiApp(Water));
