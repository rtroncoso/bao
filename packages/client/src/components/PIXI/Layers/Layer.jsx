import { PixiComponent } from '@inlet/react-pixi';

import * as PIXI from 'pixi.js';
import 'pixi-layers';
const { Layer } = PIXI.display;

export const LAYER = 'Layer';

export const behavior = {
  create: ({ group, ...props }) => {
    const instance = new Layer(group);
    return instance;
  },
};

export default PixiComponent(LAYER, behavior);
