import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { SetStateCallback, useLocalStateReducer } from '@mob/client/hooks';
import { selectToken } from '@mob/client/queries/account';
import {
  AssetEntities,
  loadAssets,
  selectBodies,
  selectGraphics,
  selectManifest
} from '@mob/client/queries/assets';
import { Dispatch, State } from '@mob/client/store';
import { useApp } from '@inlet/react-pixi';

export interface AssetSystemProps {
}

export interface AssetSystemState extends AssetEntities {
}

export interface AssetContextState {
  assetState: AssetSystemState;
  setAssetState: SetStateCallback<AssetSystemState>;
}

export const createInitialAssetState = (): AssetSystemState => ({
});

export const AssetSystemContext = createContext<AssetContextState>({
  assetState: createInitialAssetState(),
  setAssetState: null,
});

export const useAssets = () => {
  return useContext(AssetSystemContext);
};

const mapStateToProps = (state: State) => {
  return {
    bodies: selectBodies(state),
    graphics: selectGraphics(state),
    manifest: selectManifest(state),
    token: selectToken(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => (
  bindActionCreators({ loadAssets }, dispatch)
);

export type AssetSystemConnectedProps =
  & AssetSystemProps
  & ReturnType<typeof mapStateToProps>
  & ReturnType<typeof mapDispatchToProps>
;

export const AssetSystem: React.FC<AssetSystemConnectedProps> = (props) => {
  const {
    children,
    loadAssets,
  } = props;

  const [assetState, setAssetState] = useLocalStateReducer(createInitialAssetState());
  const app = useApp();

  const loadAssetsCallback = useCallback(async () => {
    const { loader } = app;
    const action = loadAssets({ loader });
    console.log(action, loader);
  }, [app, loadAssets]);

  useEffect(() => {
    loadAssetsCallback();
  }, []); // eslint-disable-line

  const assetContext = {
    setAssetState,
    assetState,
  };

  return (
    <AssetSystemContext.Provider
      value={assetContext}
    >
      {children}
    </AssetSystemContext.Provider>
  );
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(AssetSystem);
