import { all, call, fork, put, select, takeEvery } from 'redux-saga/effects';


// import BODIES_FILE from 'client/assets/init/bodies.json';
// import WEAPONS_FILE from 'client/assets/init/weapons.json';
// import SHIELDS_FILE from 'client/assets/init/shields.json';
// import EFFECTS_FILE from 'client/assets/init/effects.json';
// import HELMETS_FILE from 'client/assets/init/helmets.json';
// import HEADS_FILE from 'client/assets/init/heads.json';
// import GRAPHICS_FILE from 'client/assets/init/graphics.json';

import { getAnimations, getFileNames } from '@mob/core/loaders/graphics';
import { getGraphics } from '@mob/core/loaders/graphics/json';
// import { getBodies } from '@mob/core/loaders/bodies';
import { loadAssets, LoadAssetsPayload } from './actions';
import { Action } from 'typescript-fsa';
// import {
  // getAnimationFilePaths,
  // getTileSetFilePaths,
  // getTileSetNormalFilePaths
// } from '@mob/core/loaders/spritesheets';
// import { getWeapons } from '@mob/core/loaders/weapons';
// import { getShields } from '@mob/core/loaders/shields';
// import { getEffects } from '@mob/core/loaders/effects';
// import { getHelmets } from '@mob/core/loaders/helmets';
// import { getHeads } from '@mob/core/loaders/heads';
import { loadManifest } from './manifest';
import { selectToken } from '../account';
import { GraphicsModel, ManifestModel } from './models';
import { AuthorizedRequestParameters } from '../shared/models';
import { requestAsync } from 'redux-query';

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

// export function* handleLoadGraphics(payload: LoadAssetsPayload) {
//   const graphics = getGraphics(GRAPHICS_FILE);
//   const textures = getFileNames(graphics);
//   // console.log('before loader start', graphics, textures);

//   // yield put(updateGraphics(graphics));
//   // yield put(updateTextures(textures));

//   // loader.add(textures);
// }

export function* makeLoadManifestRequest(payload: LoadAssetsPayload) {
  const token: string = yield select(selectToken);
  const params: AuthorizedRequestParameters = ({ token });

  try {
    const response: ManifestModel = yield put(requestAsync(loadManifest(params)));
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

export function* handleLoadManifest(payload: LoadAssetsPayload) {
  console.log(payload);
  yield fork(makeLoadManifestRequest, payload);
}

export function* startLoaderSaga(payload: LoadAssetsPayload) {
  const { loader } = payload;
  const manifest: ManifestModel = yield call(handleLoadManifest, payload);
  // const graphics: GraphicsModel = yield call(handleLoadGraphics, payload);
  console.log(manifest);
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
