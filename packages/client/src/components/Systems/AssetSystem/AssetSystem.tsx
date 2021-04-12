import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { ReduxQueryDispatch, requestAsync } from 'redux-query';

import { SetStateCallback, useLocalStateReducer } from '@mob/client/hooks';
import { selectToken } from '@mob/client/queries/account';
import {
  AssetEntities,
  loadBodies,
  LoadBodiesParameters,
  loadGraphics,
  LoadGraphicsParameters,
  loadManifest,
  LoadManifestParameters,
  selectBodies,
  selectGraphics,
  selectManifest
} from '@mob/client/queries/assets';
import { State } from '@mob/client/store';

export interface AssetSystemProps {
  children?: React.ReactNode;
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

const mapDispatchToProps = (dispatch: ReduxQueryDispatch) => (
  bindActionCreators({
    loadBodies: (body?: LoadBodiesParameters) => (
      requestAsync(loadBodies({ ...body }))
    ),
    loadGraphics: (body?: LoadGraphicsParameters) => (
      requestAsync(loadGraphics({ ...body }))
    ),
    loadManifest: (body?: LoadManifestParameters) => (
      requestAsync(loadManifest({ ...body }))
    ),
  }, dispatch)
);

export type AssetSystemConnectedProps =
  & AssetSystemProps
  & ReturnType<typeof mapStateToProps>
  & ReturnType<typeof mapDispatchToProps>
;

export const AssetSystem: React.FC<AssetSystemConnectedProps> = (props) => {
  const {
    children,
    loadBodies,
    loadGraphics,
    loadManifest,
    manifest
  } = props;

  const [assetState, setAssetState] = useLocalStateReducer(createInitialAssetState());

  const loadInitsCallback = useCallback(async ({ manifest }) => {
    const bodies = await loadBodies({ manifest });
    const graphics = await loadGraphics({ manifest });
    setAssetState({
      bodies: (bodies as any).entities.bodies,
      graphics: (graphics as any).entities.graphics
    });
  }, [loadBodies, loadGraphics, setAssetState]);

  const loadManifestCallback = useCallback(async () => {
    const query = await loadManifest();
    setAssetState({
      manifest: (query as any).entities.manifest
    });
    await loadInitsCallback({ manifest });
  }, [loadInitsCallback, loadManifest, setAssetState]);

  useEffect(() => {
    loadManifestCallback();
  }, []);

  const assetContext = {
    setAssetState,
    assetState,
  };

  return (
    <AssetSystemContext.Provider
      value={assetContext}
    >
      {children as React.ReactElement}
    </AssetSystemContext.Provider>
  );
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(AssetSystem);
