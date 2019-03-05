import { withPixiApp } from '@inlet/react-pixi';
import React from 'react';

import Layer from 'client/components/PIXI/Layers/Layer';
import Stage from 'client/components/PIXI/Layers/Stage';
import Layers from 'ecs/components/map/Layers';
import System from 'ecs/System';
import { withWorld } from 'ecs/World';

class MapRenderingSystem extends System {
  constructor(props) {
    super(props);
    this.state = {};
  }

  update(delta) {
    const { world } = this.props;
    if (!this.layers) {
      const map = world.queryComponents([Layers])[0];
      this.setState({ layers: map.layers.groups });
    }
  }

  render() {
    return (
      <Stage enableSort>
        { this.state.layers && Object.values(this.state.layers).map(l => (<Layer group={l} />)) }
        { this.props.children }
      </Stage>
    );
  }
}

export default withWorld(withPixiApp(MapRenderingSystem));
