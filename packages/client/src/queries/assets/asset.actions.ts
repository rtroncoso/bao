import { actionCreatorFactory } from 'typescript-fsa';
import { LoadAssetsPayload } from './asset.model';

const actionCreator = actionCreatorFactory();

export const loadAssets = actionCreator<LoadAssetsPayload>('LOAD_ASSETS');
