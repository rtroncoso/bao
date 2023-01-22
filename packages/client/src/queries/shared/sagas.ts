import { all, fork } from 'redux-saga/effects';

import { assetSagas } from '@bao/client/queries/assets';

export function* querySagas() {
  yield all([fork(assetSagas)]);
}
