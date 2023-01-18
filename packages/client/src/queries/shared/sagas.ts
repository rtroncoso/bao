import { all, fork } from 'redux-saga/effects';

import { assetSagas } from '@mob/client/queries/assets';

export function* querySagas() {
  yield all([fork(assetSagas)]);
}
