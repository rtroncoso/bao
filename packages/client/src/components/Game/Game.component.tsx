import { Stage } from '@inlet/react-pixi';
import React from 'react';

import {
  CharacterRenderingSystem,
  KeyboardSystem,
  ViewportSystem,
} from '@mob/client/components/Systems';
import AppConstants from '@mob/core/constants/game/App';

import { ConnectedProps, GameContext } from './Game.context';
import { GameStyled, styles } from './Game.styles';

export type GameProps =
  ConnectedProps;

const Game: React.FC<GameProps> = () => {
  return (
    <GameStyled>
      <GameContext.Consumer>
        {value => (
          <Stage
            style={styles.canvasStyle}
            width={AppConstants.canvasWidth}
            height={AppConstants.canvasHeight}
          >
            <GameContext.Provider value={value}>
              <KeyboardSystem />
              <ViewportSystem>
                <CharacterRenderingSystem />
              </ViewportSystem>
            </GameContext.Provider>
          </Stage>
        )}
      </GameContext.Consumer>
    </GameStyled>
  );
}

export default Game;
