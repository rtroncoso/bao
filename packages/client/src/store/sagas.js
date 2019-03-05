import { all, fork } from 'redux-saga/effects';
import animationSagas from './animation/animation.sagas';
import assetSagas from './asset/asset.sagas';
import gameSagas from './game/game.sagas';
import renderSagas from './render/render.sagas';

export default function* rootSaga() {
  yield all([
    fork(animationSagas),
    fork(assetSagas),
    fork(gameSagas),
    fork(renderSagas),
  ]);
}
