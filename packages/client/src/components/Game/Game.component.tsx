import { Stage } from '@inlet/react-pixi';
import React from 'react';
import { ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  ViewportSystem
} from '@mob/client/components/Systems';
import { App } from '@mob/core/constants';

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

  return (
    <GameStyled>
      <ReactReduxContext.Consumer>
        {(reduxContext) => (
          <GameContext.Consumer>
            {(gameContext) => (
              <Stage height={App.canvasHeight} width={App.canvasWidth}>
                <ReactReduxContext.Provider value={reduxContext}>
                  <GameContext.Provider value={gameContext}>
                    <Systems />
                  </GameContext.Provider>
                </ReactReduxContext.Provider>
              </Stage>
            )}
          </GameContext.Consumer>
        )}
      </ReactReduxContext.Consumer>
    </GameStyled>
  );
};

export default GameComponent;
