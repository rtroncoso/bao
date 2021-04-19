import { requestAsync } from 'redux-query';
import { all, call, fork, putResolve, select, takeEvery } from 'redux-saga/effects';
import { Action } from 'typescript-fsa';

// import { getBodies } from '@mob/core/loaders/bodies';
// import { getFileNames } from '@mob/core/loaders/graphics';
import { getJsonGraphics } from '@mob/core/loaders/graphics';
import { selectToken } from '@mob/client/queries/account';
import { AuthorizedRequestParameters } from '@mob/client/queries/shared/models';
// import {
//   getAnimationFilePaths,
//   getTileSetFilePaths,
//   getTileSetNormalFilePaths
// } from '@mob/core/loaders/spritesheets';
// import { getWeapons } from '@mob/core/loaders/weapons';
// import { getShields } from '@mob/core/loaders/shields';
// import { getEffects } from '@mob/core/loaders/effects';
// import { getHelmets } from '@mob/core/loaders/helmets';
// import { getHeads } from '@mob/core/loaders/heads';
import { loadAssets, LoadAssetsPayload } from './actions';
import { loadGraphics } from './graphics';
import { loadManifest } from './manifest';
import { selectGraphics, selectManifest } from './selectors';

// import {
//   LOADING_COMPLETE,
//   LOADING_START,
//   updateAnimations,
//   updateBodies,
//   updateEffects,
//   updateGraphics,
//   updateHeads,
//   updateHelmets,
//   updateResources,
//   updateShields,
//   updateSpriteSheets,
//   updateTextures,
//   updateWeapons
// } from 'store/asset/asset.state';
// import { selectGraphics } from './selectors';

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

export function* handleLoadGraphics(payload: LoadAssetsPayload) {
  const manifest = yield select(selectManifest);
  const token: string = yield select(selectToken);

  try {
    // const { loader } = payload;
    yield putResolve(requestAsync(loadGraphics({ manifest, token })));
    const graphics = yield select(selectGraphics);
    console.log(graphics);
    console.log(getJsonGraphics(graphics));
    // const graphicsConverted = getJsonGraphics(graphics);
    // const textures = getFileNames(graphics);
    // console.log(graphics, graphicsConverted, textures);
    // loader.add(textures);
  } catch (error) {
    console.log(error);
  }
  // console.log('before loader start', graphics, textures);

  // yield put(updateGraphics(graphics));
  // yield put(updateTextures(textures));

  // loader.add(textures);
}

export function* handleLoadManifest(payload: LoadAssetsPayload) {
  const token: string = yield select(selectToken);
  const params: AuthorizedRequestParameters = ({ token });

  try {
    yield putResolve(requestAsync(loadManifest(params)));
    yield call(handleLoadGraphics, payload)
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
