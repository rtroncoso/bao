import { requestAsync } from 'redux-query';
import { all, call, fork, putResolve, select, takeEvery } from 'redux-saga/effects';
import { Action } from 'typescript-fsa';

import { selectToken } from '@mob/client/queries/account';
import { loadAssets } from './actions';
import { loadBodies } from './bodies';
import { loadGraphics } from './graphics';
import { loadManifest } from './manifest';
import {
  LoadAssetsPayload,
  LoadBodiesPayload,
  LoadGraphicsPayload,
  LoadManifestPayload
} from './models';
import {
  selectAnimations,
  selectGraphics,
  selectManifest
} from './selectors';

// export function* handleLoaderCallback() {
//   const { payload: resources } = yield take(LOADING_COMPLETE);
//   const graphics = yield select(selectGraphics);
//   const animations = getAnimations(graphics);
//   const bodies = getBodies(BODIES_FILE, animations);
//   const weapons = getWeapons(WEAPONS_FILE, animations);
//   const shields = getShields(SHIELDS_FILE, animations);
//   const effects = getEffects(EFFECTS_FILE, animations);
//   const helmets = getHelmets(HELMETS_FILE, graphics);
//   const heads = getHeads(HEADS_FILE, graphics);

//   // const graphicFiles = getFileNames(getStaticGraphics(graphics));
//   // const animationFiles = getFileNames(getAnimatedGraphics(graphics));
//   // console.log(graphicFiles, animationFiles);
//   yield put(updateResources(resources));
//   yield put(updateAnimations(animations));
//   yield put(updateBodies(bodies));
//   yield put(updateWeapons(weapons));
//   yield put(updateShields(shields));
//   yield put(updateEffects(effects));
//   yield put(updateHelmets(helmets));
//   yield put(updateHeads(heads));
//   yield put(push(GAME_PATH));
// }

// export function* loadSpriteSheets(loader) {
//   const tilesets = getTileSetFilePaths();
//   const animations = getAnimationFilePaths();

//   yield put(updateSpriteSheets({ tilesets, animations }));
//   loader.add([...tilesets, ...animations]);
// }

export function* handleLoadBodies(payload: LoadBodiesPayload) {
  try {
    yield putResolve(requestAsync(loadBodies(payload)));
  } catch (error) {
    console.log(error);
  }
}

export function* handleLoadGraphics(payload: LoadGraphicsPayload) {
  try {
    yield putResolve(requestAsync(loadGraphics(payload)));
    const graphics = yield select(selectGraphics);
    const animations = yield select(selectAnimations);

    yield call(handleLoadBodies, { ...payload, animations, graphics });
  } catch (error) {
    console.log(error);
  }
}

export function* handleLoadManifest(payload: LoadAssetsPayload) {
  const token: string = yield select(selectToken);
  const params: LoadManifestPayload = ({ ...payload, token });

  try {
    yield putResolve(requestAsync(loadManifest(params)));
    const manifest = yield select(selectManifest);

    yield all([
      call(handleLoadGraphics, { ...params, manifest })
    ]);
  } catch (error) {
    console.log(error);
  }
}

export function* startLoaderSaga(payload: LoadAssetsPayload) {
  const { loader } = payload;
  yield call(handleLoadManifest, payload);
  loader.load();
}

export function* watchStartLoadAssets() {
  yield takeEvery(loadAssets.type, (action: Action<LoadAssetsPayload>) => (
    startLoaderSaga(action.payload)
  ));
}

export function* assetSagas() {
  yield all([
    fork(watchStartLoadAssets),
  ]);
}
