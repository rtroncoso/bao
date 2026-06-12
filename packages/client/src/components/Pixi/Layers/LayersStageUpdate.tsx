import { useTick } from '@inlet/react-pixi';
import React from 'react';

import { layersStageRef } from './layersStageRef';

/** Runs updateStage on the Pixi app ticker after viewport sync useTick hooks. */
export const LayersStageUpdate: React.FC = () => {
  useTick(() => {
    const stage = layersStageRef.current;
    if (!stage || stage.destroyed || !stage.parent) {
      return;
    }

    stage.updateStage();
  });

  return null;
};
