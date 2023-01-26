import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { SetStateCallback, useLocalStateReducer } from '@bao/client/hooks';
import { selectToken } from '@bao/client/queries/account';
import {
  AssetEntities,
  BodiesEntityModel,
  loadAssets,
  selectBodies,
  selectGraphics,
  selectManifest
} from '@bao/client/queries/assets';
import { Dispatch, State } from '@bao/client/store';
import { useApp } from '@inlet/react-pixi';
import { getAllTextures } from '@bao/core';

export type AssetSystemProps = object;
export type AssetSystemState = AssetEntities;

export interface AssetContextState {
  assetState: AssetSystemState;
  setAssetState: SetStateCallback<AssetSystemState>;
  bodies?: BodiesEntityModel | any[];
}

export const createInitialAssetState = (): AssetSystemState => ({});

export const AssetSystemContext = createContext<AssetContextState>({
  assetState: createInitialAssetState(),
  setAssetState: null,
  bodies: []
});

export const useAssetsContext = () => {
  return useContext(AssetSystemContext);
};

const mapStateToProps = (state: State) => {
  return {
    bodies: selectBodies(state),
    graphics: selectGraphics(state),
    manifest: selectManifest(state),
    token: selectToken(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadAssets }, dispatch);

type ConnectedProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export type AssetSystemConnectedProps = AssetSystemProps & ConnectedProps;

export const AssetSystem: React.FC<AssetSystemConnectedProps> = ({
  bodies,
  ...props
  // graphics,
  // manifest,
  // token
}) => {
  const app = useApp();
  const [loaded, setLoaded] = useState(false);
  const { children, loadAssets } = props;

  const [assetState, setAssetState] = useLocalStateReducer(
    createInitialAssetState()
  );

  const loadAssetsCallback = useCallback(async () => {
    const { loader } = app;
    loadAssets({ loader });
    loader.onComplete.add(() => setLoaded(true));
  }, [app, loadAssets]);

  useEffect(() => {
    loadAssetsCallback();
  }, []);

  useEffect(() => {
    setAssetState({ ...assetState, bodies });
  }, [bodies]);

  const assetContext = {
    setAssetState,
    assetState
  };

  return (
    <AssetSystemContext.Provider value={assetContext}>
      {loaded && children}
    </AssetSystemContext.Provider>
  );
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  AssetSystem
);
