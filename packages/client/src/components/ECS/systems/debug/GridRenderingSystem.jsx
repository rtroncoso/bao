import { Container, withPixiApp } from '@inlet/react-pixi';
import { Graphics } from 'pixi.js';
import React from 'react';

import System from 'ecs/System';
import { withWorld } from 'ecs/World';
import { TILE_SIZE, TILED_MAP_SIZE } from 'core/constants/game/Map';

class GridRenderingSystem extends System {
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }

  componentDidMount() {
    const g = new Graphics();
    g.lineStyle(1, 0xff0000, 0.4);

    for (let y = 0; y < TILED_MAP_SIZE[1]; y++) {
      g.moveTo(0, y * TILE_SIZE);
      g.lineTo(TILED_MAP_SIZE[0] * TILE_SIZE, y * TILE_SIZE);
    }

    for (let x = 0; x < TILED_MAP_SIZE[0]; x++) {
      g.moveTo(x * TILE_SIZE, 0);
      g.lineTo(x * TILE_SIZE, TILED_MAP_SIZE[1] * TILE_SIZE);
    }

    this.container.current.addChild(g);
  }

  render() {
    return (
      <Container ref={this.container} />
    );
  }
}

export default withWorld(withPixiApp(GridRenderingSystem));
