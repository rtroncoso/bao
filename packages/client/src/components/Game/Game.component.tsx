import { Stage } from '@inlet/react-pixi';
import React, { useContext, useEffect } from 'react';
import { Provider, ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  MapRenderingSystem,
  ViewportSystem
} from '@bao/client/components/Systems';
import { App } from '@bao/core/constants';
import { Stage as LayersStage } from '@bao/client/components/Pixi';

import { GameConnectedProps, GameContext } from './Game.context';
import { GameStyled } from './Game.styles';
import { TiledMap } from '../Entities';

export type GameComponentProps = GameConnectedProps;

export const Systems: React.FC = () => {
  return (
    <LayersStage enableSort>
      <AssetSystem>
        <MapRenderingSystem>
          <ViewportSystem>
            <KeyboardSystem />
            <TiledMap />
            <CharacterRenderingSystem />
          </ViewportSystem>
        </MapRenderingSystem>
      </AssetSystem>
    </LayersStage>
  );
};

export const GameComponent: React.FC<GameComponentProps> = () => {
  if (typeof window === undefined) return null;
  const gameContext = useContext(GameContext);
  const reduxContext = useContext(ReactReduxContext);

  return (
    <GameStyled>
      <Stage height={App.canvasHeight} width={App.canvasWidth}>
        <Provider store={reduxContext.store}>
          <GameContext.Provider value={gameContext}>
            <Systems />
          </GameContext.Provider>
        </Provider>
      </Stage>
    </GameStyled>
  );
};

export default GameComponent;
