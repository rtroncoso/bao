import { actionCreatorFactory } from 'typescript-fsa';
import { LoadAssetsPayload } from './models';

const actionCreator = actionCreatorFactory();

export const loadAssets = actionCreator<LoadAssetsPayload>('LOAD_ASSETS');
