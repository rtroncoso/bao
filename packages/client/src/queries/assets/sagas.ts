import { requestAsync } from 'redux-query';
import {
  all,
  call,
  fork,
  putResolve,
  select,
  takeEvery
} from 'redux-saga/effects';
import { Action } from 'typescript-fsa';

import { selectToken } from '@mob/client/queries/account';
import { loadAssets } from './actions';
import {
  LoadAssetsPayload,
  LoadResourcePayload,
  LoadGraphicsPayload,
  LoadManifestPayload
} from './models';
import {
  loadBodies,
  loadEffects,
  loadGraphics,
  loadHeads,
  loadHelmets,
  loadManifest,
  loadShields,
  loadWeapons
} from './requests';
import { selectAnimations, selectGraphics, selectManifest } from './selectors';

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

export function* handleLoadHeads(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadHeads(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadEffects(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadEffects(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadHelmets(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadHelmets(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadBodies(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadBodies(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadShields(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadShields(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadWeapons(payload: LoadResourcePayload) {
  try {
    yield putResolve(requestAsync(loadWeapons(payload)));
  } catch (error) {
    console.error(error);
  }
}

export function handleLoadSpritesheets(payload: LoadResourcePayload) {
  const spritesheetExtensions = ['png', 'json'];
  const { loader, manifest } = payload;

  for (const tileset of manifest.textures.tilesets) {
    for (const extension of spritesheetExtensions) {
      loader.add(
        `${process.env.NEXT_PUBLIC_MOB_ASSETS}/${tileset}.${extension}`
      );
    }
  }

  for (const animation of manifest.textures.animations) {
    for (const extension of spritesheetExtensions) {
      loader.add(
        `${process.env.NEXT_PUBLIC_MOB_ASSETS}/${animation}.${extension}`
      );
    }
  }
}

export function* handleLoadGraphics(payload: LoadGraphicsPayload) {
  try {
    const { loader } = payload;
    yield putResolve(requestAsync(loadGraphics(payload)));
    const graphics = yield select(selectGraphics);
    const animations = yield select(selectAnimations);
    const params: LoadResourcePayload = {
      ...payload,
      animations,
      graphics
    };

    yield all([
      call(handleLoadSpritesheets, params),
      call(handleLoadBodies, params),
      call(handleLoadEffects, params),
      call(handleLoadHeads, params),
      call(handleLoadHelmets, params),
      call(handleLoadShields, params),
      call(handleLoadWeapons, params)
    ]);

    loader.load();
  } catch (error) {
    console.error(error);
  }
}

export function* handleLoadManifest(payload: LoadAssetsPayload) {
  const token: string = yield select(selectToken);
  const params: LoadManifestPayload = { ...payload, token };

  try {
    yield putResolve(requestAsync(loadManifest(params)));
    const manifest = yield select(selectManifest);

    yield call(handleLoadGraphics, { ...params, manifest });
  } catch (error) {
    console.error(error);
  }
}

export function* startLoaderSaga(payload: LoadAssetsPayload) {
  const { loader } = payload;
  yield call(handleLoadManifest, payload);
  console.log('Everything loaded');
  loader.load();
}

export function* watchStartLoadAssets() {
  yield takeEvery(loadAssets.type, (action: Action<LoadAssetsPayload>) =>
    startLoaderSaga(action.payload)
  );
}

export function* assetSagas() {
  yield all([fork(watchStartLoadAssets)]);
}
