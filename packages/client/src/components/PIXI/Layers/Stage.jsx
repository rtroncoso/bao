import { PixiComponent } from '@inlet/react-pixi';

import * as PIXI from 'pixi.js';
import 'pixi-layers';
const { Stage } = PIXI.display;

export const STAGE = 'Stage';
export const behavior = {
  create: ({ enableSort = false, ...props }) => {
    const stage = new Stage();
    stage.group.enableSort = enableSort;
    return stage;
  },

  didMount(instance) {
    const updateStage = () => {
      instance.updateStage();
      instance._updateStageRafId = window.requestAnimationFrame(updateStage);
    };
    updateStage();
  },

  willUnmount(instance) {
    window.cancelAnimationFrame(instance._updateStageRafId);
    instance.destroy();
  },
};

export default PixiComponent(STAGE, behavior);
