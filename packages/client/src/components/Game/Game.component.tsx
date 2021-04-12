import { Stage } from '@inlet/react-pixi';
import React from 'react';
import { ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  ViewportSystem,
} from '@mob/client/components/Systems';
import AppConstants from '@mob/core/constants/game/App';

import { ConnectedProps, GameContext } from './Game.context';
import { GameStyled, styles } from './Game.styles';

export type GameComponentProps =
  ConnectedProps;

export const Systems = () => {
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
  return (
    <GameStyled>
      <ReactReduxContext.Consumer>
        {reduxContext => (
          <GameContext.Consumer>
            {gameContext => (
              <Stage
                style={styles.canvasStyle}
                width={AppConstants.canvasWidth}
                height={AppConstants.canvasHeight}
              >
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
}

export default GameComponent;
