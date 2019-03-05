import { createSelector } from 'reselect';

export const renderState = state => state.Render;

export const selectTick = createSelector(
  renderState,
  state => state.tick
);

export const selectCurrentTime = createSelector(
  renderState,
  state => state.currentTime
);

export const selectStageCenter = createSelector(
  renderState,
  state => state.stageCenter
);

export const selectResolution = createSelector(
  renderState,
  state => state.resolution
);

export const selectCanvasHeight = createSelector(
  renderState,
  state => state.canvasHeight
);

export const selectCanvasWidth = createSelector(
  renderState,
  state => state.canvasWidth
);


export const selectWindowHeight = createSelector(
  renderState,
  state => state.height
);

export const selectWindowWidth = createSelector(
  renderState,
  state => state.width
);

export default null;
