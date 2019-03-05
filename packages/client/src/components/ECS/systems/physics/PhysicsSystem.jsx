import { withPixiApp } from '@inlet/react-pixi';
import React from 'react';

import Scene, { SceneFamily } from 'ecs/entities/physics/Scene';
import { withWorld } from 'ecs/World';
import System from 'ecs/System';

class PhysicsSystem extends System {
  render() {
    return (
      <Scene components={SceneFamily} />
    );
  }
}

export default withWorld(withPixiApp(PhysicsSystem));
