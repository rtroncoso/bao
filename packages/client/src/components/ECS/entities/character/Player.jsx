import { withPixiApp } from '@inlet/react-pixi';
import React from 'react';

import Debug from 'ecs/components/common/Debug';
import Controllable from 'ecs/components/character/Controllable';
import { withWorld } from 'ecs/World';

import Character, { CharacterFamily } from './Character';

export const PlayerControllableFamily = [...CharacterFamily, Debug, Controllable];
class Player extends Character {
  constructor(props) {
    super(props);
  }
}

export default withWorld(withPixiApp(Player));
