import { Stage } from '@inlet/react-pixi';
import React, { useContext } from 'react';
import { Provider, ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  ViewportSystem
} from '@bao/client/components/Systems';
import { App } from '@bao/core/constants';

import { GameConnectedProps, GameContext } from './Game.context';
import { GameStyled } from './Game.styles';

export type GameComponentProps = GameConnectedProps;

export const Systems: React.FC = () => {
  return (
    <AssetSystem>
      <KeyboardSystem />
      <ViewportSystem>
        <CharacterRenderingSystem />
      </ViewportSystem>
    </AssetSystem>
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
