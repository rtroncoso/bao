import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { useApp } from '@inlet/react-pixi';

import { SetStateCallback, useLocalStateReducer } from '@bao/client/hooks';
import { ProgressBar } from '@bao/client/components/Pixi';
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
import { App } from '@bao/core';

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
  children,
  loadAssets
}) => {
  const app = useApp();
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const [assetState, setAssetState] = useLocalStateReducer(
    createInitialAssetState()
  );

  const loadAssetsCallback = useCallback(async () => {
    const { loader } = app;
    loadAssets({ loader });
    loader.onComplete.add(() => setLoaded(true));
    loader.onProgress.add(() => setProgress(loader.progress / 100));
  }, [app, loadAssets]);

  useEffect(() => {
    const { loader } = app;
    loadAssetsCallback();
    return () => loader.destroy();
  }, []);

  const assetContext = {
    setAssetState,
    assetState
  };

  return (
    <AssetSystemContext.Provider value={assetContext}>
      {loaded && children}
      {!loaded && (
        <ProgressBar
          label="Cargando recursos"
          backgroundColor={0x000000}
          foregroundColor={0xff0000}
          x={App.canvasWidth / 2}
          y={App.canvasHeight / 2}
          progress={progress}
          width={200}
          height={5}
        />
      )}
    </AssetSystemContext.Provider>
  );
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  AssetSystem
);
