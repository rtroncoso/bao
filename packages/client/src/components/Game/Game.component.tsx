import { Stage } from '@inlet/react-pixi';
import React, { useContext, useMemo } from 'react';
import { FpsView } from '@bao/react-fps';
import { Provider, ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  MapRenderingSystem,
  ViewportSystem
} from '@bao/client/components/Systems';
import { ChatComponent, ChatContext, useChatContext } from '@bao/client/components/Chat';
import { TiledMap } from '@bao/client/components/Entities';
import { Stage as LayersStage } from '@bao/client/components/Pixi';
import { App } from '@bao/core/constants';

import { GameConnectedProps, GameContext } from './Game.context';
import { GameStyled } from './Game.styles';

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
  const chatContext = useChatContext();
  const gameContext = useContext(GameContext);
  const reduxContext = useContext(ReactReduxContext);

  const { width, height } = useMemo(() => {
    const width = (16 * window.innerHeight) / 9;
    const height = (9 * window.innerWidth) / 16;
    return { width, height };
  }, [window.innerWidth, window.innerHeight]);

  return (
    <GameStyled width={width} height={height}>
      <Stage width={App.canvasWidth} height={App.canvasHeight}>
        <Provider store={reduxContext.store}>
          <GameContext.Provider value={gameContext}>
            <ChatContext.Provider value={chatContext}>
              <Systems />
            </ChatContext.Provider>
          </GameContext.Provider>
        </Provider>
      </Stage>
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
  );
};

export default GameComponent;
