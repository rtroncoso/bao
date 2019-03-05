import { push } from 'connected-react-router';
import { all, call, fork, put, select, take } from 'redux-saga/effects';

import BODIES_FILE from 'client/assets/init/bodies.json';
import WEAPONS_FILE from 'client/assets/init/weapons.json';
import SHIELDS_FILE from 'client/assets/init/shields.json';
import EFFECTS_FILE from 'client/assets/init/effects.json';
import HELMETS_FILE from 'client/assets/init/helmets.json';
import HEADS_FILE from 'client/assets/init/heads.json';
import GRAPHICS_FILE from 'client/assets/init/graphics.json';

import { getAnimations, getFileNames } from 'core/loaders/graphics';
import { getGraphics } from 'core/loaders/graphics/json';
import { getBodies } from 'core/loaders/bodies';
import {
  getAnimationFilePaths,
  getTileSetFilePaths,
  getTileSetNormalFilePaths
} from 'core/loaders/spritesheets';
import { getWeapons } from 'core/loaders/weapons';
import { getShields } from 'core/loaders/shields';
import { getEffects } from 'core/loaders/effects';
import { getHelmets } from 'core/loaders/helmets';
import { getHeads } from 'core/loaders/heads';

import { GAME_PATH, LOADER_PATH } from 'client/routes';
import {
  LOADING_COMPLETE,
  LOADING_START,
  updateAnimations,
  updateBodies,
  updateEffects,
  updateGraphics,
  updateHeads,
  updateHelmets,
  updateResources,
  updateShields,
  updateSpriteSheets,
  updateTextures,
  updateWeapons
} from 'store/asset/asset.state';
import { selectGraphics } from './asset.selectors';

export function* handleLoaderCallback() {
  const { payload: resources } = yield take(LOADING_COMPLETE);
  const graphics = yield select(selectGraphics);
  const animations = getAnimations(graphics);
  const bodies = getBodies(BODIES_FILE, animations);
  const weapons = getWeapons(WEAPONS_FILE, animations);
  const shields = getShields(SHIELDS_FILE, animations);
  const effects = getEffects(EFFECTS_FILE, animations);
  const helmets = getHelmets(HELMETS_FILE, graphics);
  const heads = getHeads(HEADS_FILE, graphics);

  // const graphicFiles = getFileNames(getStaticGraphics(graphics));
  // const animationFiles = getFileNames(getAnimatedGraphics(graphics));
  // console.log(graphicFiles, animationFiles);
  yield put(updateResources(resources));
  yield put(updateAnimations(animations));
  yield put(updateBodies(bodies));
  yield put(updateWeapons(weapons));
  yield put(updateShields(shields));
  yield put(updateEffects(effects));
  yield put(updateHelmets(helmets));
  yield put(updateHeads(heads));
  yield put(push(GAME_PATH));
}

export function* loadSpriteSheets(loader) {
  const tilesets = getTileSetFilePaths();
  const animations = getAnimationFilePaths();

  yield put(updateSpriteSheets({ tilesets, animations }));
  loader.add([...tilesets, ...animations]);
}

export function* loadGraphics(loader) {
  const graphics = getGraphics(GRAPHICS_FILE);
  const textures = getFileNames(graphics);
  // console.log('before loader start', graphics, textures);

  yield put(updateGraphics(graphics));
  yield put(updateTextures(textures));

  // loader.add(textures);
}

export function* watchStartLoading() {
  while (true) {
    const { payload: loader } = yield take(LOADING_START);
    yield call(loadSpriteSheets, loader);
    yield call(loadGraphics, loader);
    loader.load();
  }
}

export function* startLoaderSaga() {
  yield fork(handleLoaderCallback);
  yield put(push(LOADER_PATH));
}

export default function* assetSagas() {
  yield all([
    fork(watchStartLoading),
  ]);
}
