import { Loader } from 'pixi.js';
import { actionCreatorFactory } from 'typescript-fsa';

export interface LoadAssetsPayload {
  loader: Loader;
}

const actionCreator = actionCreatorFactory();

export const loadAssets = actionCreator<LoadAssetsPayload>('LOAD_ASSETS');
