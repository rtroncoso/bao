import React, { useContext, useEffect, useState } from 'react';
import { FpsView } from '@bao/react-fps';
import { Provider, ReactReduxContext } from 'react-redux';

import { Character } from '@bao/client/components/Entities/Character';
import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  MapRenderingSystem,
  ViewportSystem
} from '@bao/client/components/Systems';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import {
  ChatComponent,
  ChatContext,
  useChatContext
} from '@bao/client/components/Chat';
import { TiledMap } from '@bao/client/components/Entities';
import { GameStage, Stage as LayersStage } from '@bao/client/components/Pixi';
import { App } from '@bao/core/constants';

import { computeSixteenByNineViewport } from '@bao/client/lib/game-viewport';

import { GameConnectedProps, GameContext } from './Game.context';
import { GamePageShell, GameStyled } from './Game.styles';

export type GameComponentProps = GameConnectedProps;

export const Systems: React.FC = () => {
  const { state } = useContext(GameContext);
  const localCharacter = resolveLocalCharacter(
    state.serverState,
    state.characterId,
    state.room?.sessionId
  );

  return (
    <LayersStage enableSort>
      <AssetSystem>
        <MapRenderingSystem>
          <ViewportSystem
            overlay={
              localCharacter ? (
                <Character
                  key={localCharacter.sessionId}
                  character={localCharacter}
                  isLocalPlayer
                  x={App.canvasWidth / 2}
                  y={App.canvasHeight / 2}
                />
              ) : null
            }
          >
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
  const chatContext = useChatContext();
  const gameContext = useContext(GameContext);
  const reduxContext = useContext(ReactReduxContext);

  const [layout, setLayout] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateLayout = () => {
      setLayout(computeSixteenByNineViewport());
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const { width, height } = layout;

  return (
    <GamePageShell>
      <GameStyled width={width} height={height}>
        <GameStage width={App.canvasWidth} height={App.canvasHeight}>
          <Provider store={reduxContext.store}>
            <GameContext.Provider value={gameContext}>
              <ChatContext.Provider value={chatContext}>
                <Systems />
              </ChatContext.Provider>
            </GameContext.Provider>
          </Provider>
        </GameStage>
        <ChatComponent />
        {gameContext.state.debug && (
          <FpsView
            width={70}
            height={30}
            left={null}
            right={60}
            top={20}
            bottom={null}
          />
        )}
      </GameStyled>
    </GamePageShell>
  );
};

export default GameComponent;
