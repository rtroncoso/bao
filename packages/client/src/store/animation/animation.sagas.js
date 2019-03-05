import {
  all, fork, select, take
} from 'redux-saga/effects';

import { UPDATE_ANIMATED_ENTITIES } from 'store/animation/animation.state';
import { TICK } from 'store/render/render.state';

/**
 * Stores animated thingies for demo
 * @type {Array<Thingie>}
 */
let animatedEntityList = [];

function* animationLoop() {
  while (true) {
    const { delta } = yield take(TICK);

    for (const entity of animatedEntityList) {
      entity.update(delta);
    }
  }
}

function* watchUpdateEntities() {
  while (true) {
    const { payload: { entities } } = yield take(UPDATE_ANIMATED_ENTITIES);
    animatedEntityList = entities;
  }
}

export default function* animationSagas() {
  yield all([
    fork(animationLoop),
    fork(watchUpdateEntities)
  ]);
}
