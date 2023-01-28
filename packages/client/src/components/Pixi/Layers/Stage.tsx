import { PixiComponent } from '@inlet/react-pixi';
import { Stage as PixiStage } from '@pixi/layers';

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
    const updateStage = () => {
      instance.updateStage();
      this._updateStageRefId = window.requestAnimationFrame(updateStage);
    };
    updateStage();
  },

  willUnmount(instance) {
    window.cancelAnimationFrame(this._updateStageRefId);
    instance.destroy();
  }
});
