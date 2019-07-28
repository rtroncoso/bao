import { useApp } from '@inlet/react-pixi';
import React from 'react';

import Debug from 'ecs/components/common/Debug';
import Controllable from 'ecs/components/character/Controllable';
import { useWorld } from 'ecs/World';

import Character, { CharacterFamily } from './Character';

export const PlayerControllableFamily = [...CharacterFamily, Debug, Controllable];
const Player = React.forwardRef((props, ref) => {
  const world = useWorld();
  const app = useApp();

  return (
    <Character
      {...props}
      ref={ref}
      app={app}
      world={world}
    />
  );
});

export default Player;
