import {
  all, fork, put, take
} from 'redux-saga/effects';

import { startLoaderSaga } from '../asset/asset.sagas';
import { START_GAME } from './game.state';

export function* gameSaga() {
  while (true) {
    yield take(START_GAME);
    yield fork(startLoaderSaga);
  }
}

export default function* gameSagas() {
  yield all([
    fork(gameSaga),
  ]);
}
