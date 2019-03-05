import { createAction } from 'redux-actions';
import { createReducers } from 'redux-arc';
import { canvasWidth, canvasHeight } from 'core/constants/game/App';

export const RESIZE = 'mob/render/RESIZE';
export const START = 'mob/render/START';
export const STOP = 'mob/render/STOP';
export const TICK = '@@render/TICK';

export const tick = createAction(TICK, (delta, fps) => ({ delta, fps }));
export const resize = createAction(RESIZE);
export const startRender = createAction(START);
export const stopRender = createAction(STOP);

const windowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: window.devicePixelRatio,
  stageCenter: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
});

export const defaultStats = {
  fps: 0,
  tick: 1,
  delta: 0,
  previousTick: 0,
  startTime: window.performance.now(),
  currentTime: window.performance.now()
};

export const defaultState = {
  stats: defaultStats,
  isActive: false,
  canvasHeight,
  canvasWidth,
  canvasCenter: {
    x: canvasWidth / 2,
    y: canvasHeight / 2
  },
  ...windowSize()
};

const HANDLERS = {
  [RESIZE]: (state, action) => ({ ...state, ...windowSize() }),
  [START]: (state, action) => ({ ...state, isActive: true }),
  [STOP]: (state, action) => ({ ...state, isActive: false }),
  [TICK]: (state, action) => ({
    ...state,
    stats: {
      fps: action.fps,
      delta: action.delta,
      tick: state.tick + 1,
      previousTick: state.tick,
      currentTime: window.performance.now()
    }
  }),
};

export default createReducers(defaultState, HANDLERS);
