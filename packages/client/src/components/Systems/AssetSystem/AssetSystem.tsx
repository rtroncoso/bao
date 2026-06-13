import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { SetStateCallback, useLocalStateReducer } from '@bao/client/hooks';
import { PixiAssetLoader } from '@bao/client/lib/pixi-asset-loader';
import { ProgressBar } from '@bao/client/components/Pixi';
import {
  AssetEntities,
  BodiesEntityModel,
  loadAssets
} from '@bao/client/queries/assets';
import { Dispatch } from '@bao/client/store';
import { App } from '@bao/core';

export type AssetSystemProps = object;
export type AssetSystemState = AssetEntities;

export interface AssetContextState {
  assetState: AssetSystemState;
  setAssetState: SetStateCallback<AssetSystemState>;
  bodies?: BodiesEntityModel | any[];
  loader: PixiAssetLoader | null;
  loaded: boolean;
  progress: number;
}

export const createInitialAssetState = (): AssetSystemState => ({});

export const AssetSystemContext = createContext<AssetContextState>({
  assetState: createInitialAssetState(),
  setAssetState: null,
  bodies: [],
  loader: null,
  loaded: false,
  progress: 0
});

export const useAssetsContext = () => {
  return useContext(AssetSystemContext);
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadAssets }, dispatch);

type ConnectedProps = ReturnType<typeof mapDispatchToProps>;

export type AssetSystemConnectedProps = AssetSystemProps &
  ConnectedProps & {
    children?: React.ReactNode;
  };

export const AssetSystem = ({
  children,
  loadAssets
}: AssetSystemConnectedProps) => {
  const [loader] = useState(() => new PixiAssetLoader());
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadStartedRef = useRef(false);

  const [assetState, setAssetState] = useLocalStateReducer(
    createInitialAssetState()
  );

  useEffect(() => {
    const handleComplete = () => {
      setLoaded(true);
      setProgress(1);
    };

    const handleProgress = () => {
      setProgress(loader.progress / 100);
    };

    loader.onComplete.add(handleComplete);
    loader.onProgress.add(handleProgress);

    if (!loadStartedRef.current) {
      loadStartedRef.current = true;
      loadAssets({ loader });
    }

    return () => {
      loader.onComplete.remove(handleComplete);
      loader.onProgress.remove(handleProgress);
    };
  }, [loader, loadAssets]);

  const assetContext = {
    setAssetState,
    assetState,
    loader,
    loaded,
    progress
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

export default compose(connect(null, mapDispatchToProps))(AssetSystem);
