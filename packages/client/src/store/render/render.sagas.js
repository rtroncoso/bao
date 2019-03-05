/**
 * render.sagas Handles main entry-point logic:
 *
 * - Dispatches render tick action
 */

import React from 'react';
import {
  all, call, fork, put, take
} from 'redux-saga/effects';

import { startGame } from 'store/game/game.state';
import Store from 'store/store';
import { renderApp } from 'client/app';
import {
  resize, startRender, START, STOP, tick
} from './render.state';

import 'fpsmeter';
const { FPSMeter } = window;

let isActive = false;
let fpsMeter = null;

function resizeHandler() {
  Store.dispatch(resize());
}

function contextMenuHandler(e) {
  e.preventDefault();
}

function renderLoop() {
  if (isActive) {
    const { duration, fps } = fpsMeter;

    fpsMeter.tickStart();
    // Store.dispatch(tick(duration, fps));
    renderApp();
    fpsMeter.tick();

    window.requestAnimationFrame(renderLoop.bind(this));
  }
}

function* renderSetupSaga() {
  fpsMeter = new FPSMeter(document.body, { maxFps: 60, heat: 1, graph: 1 });

  yield put(startRender());
  yield put(startGame());
  yield call(resizeHandler);
}

function* watchStartSaga() {
  while (true) {
    yield take(START);
    isActive = true;

    window.addEventListener('contextmenu', contextMenuHandler);
    window.addEventListener('resize', resizeHandler);
    window.requestAnimationFrame(renderLoop);
  }
}

function* watchStopSaga() {
  while (true) {
    yield take(STOP);
    isActive = false;

    window.removeEventListener('contextmenu', contextMenuHandler);
    window.removeEventListener('resize', resizeHandler);
  }
}

export default function* renderSagas() {
  yield all([
    fork(renderSetupSaga),
    fork(watchStartSaga),
    fork(watchStopSaga),
  ]);
}
