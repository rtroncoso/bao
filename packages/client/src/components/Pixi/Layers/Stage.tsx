import { PixiComponent } from '@inlet/react-pixi';
import { Stage as PixiStage } from '@pixi/layers';

import { layersStageRef } from './layersStageRef';

export interface StageProps {
  enableSort: boolean;
}

export const Stage = PixiComponent<StageProps, PixiStage>('Stage', {
  create: ({ enableSort = false }) => {
    const stage = new PixiStage();
    stage.group.enableSort = enableSort;
    return stage;
  },

  didMount(instance) {
    layersStageRef.current = instance;
  },

  willUnmount(instance) {
    if (layersStageRef.current === instance) {
      layersStageRef.current = null;
    }
    instance.destroy();
  }
});
