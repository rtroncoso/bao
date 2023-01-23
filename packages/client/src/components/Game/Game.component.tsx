import { Stage } from '@inlet/react-pixi';
import React, { useContext } from 'react';
import { ReactReduxContext } from 'react-redux';

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
    <React.Fragment>
      <KeyboardSystem />
      <AssetSystem />
      <ViewportSystem>
        <CharacterRenderingSystem />
      </ViewportSystem>
    </React.Fragment>
  );
};

export const GameComponent: React.FC<GameComponentProps> = () => {
  if (typeof window === undefined) return null;
  const reduxContext = useContext(ReactReduxContext);
  const gameContext = useContext(GameContext);

  return (
    <GameStyled>
      <Stage height={App.canvasHeight} width={App.canvasWidth}>
        <ReactReduxContext.Provider value={reduxContext}>
          <GameContext.Provider value={gameContext}>
            <Systems />
          </GameContext.Provider>
        </ReactReduxContext.Provider>
      </Stage>
    </GameStyled>
  );
};

export default GameComponent;
