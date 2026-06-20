import React, { useContext, useEffect, useState } from 'react';
import { FpsView } from '@bao/react-fps';
import { Provider, ReactReduxContext } from 'react-redux';

import {
  AssetSystem,
  AudioSystem,
  CharacterRenderingSystem,
  KeyboardSystem,
  MapInteractionSystem,
  MapRenderingSystem,
  ViewportSystem,
  WorldSystem
} from '@bao/client/components/Systems';
import { FootstepAudioSync } from '@bao/client/components/Systems/AudioSystem/FootstepAudioSync';
import {
  ChatComponent,
  ChatContext,
  useChatContext
} from '@bao/client/components/Chat';
import { TiledMap } from '@bao/client/components/Entities';
import { GameStage } from '@bao/client/components/Pixi';
import { App } from '@bao/core/constants';

import { computeSixteenByNineViewport } from '@bao/client/lib/game-viewport';
import { GameSettingsPanel } from '@bao/client/components/Settings';

import { GameConnectedProps, GameContext } from './Game.context';
import { GamePageShell, GameStyled } from './Game.styles';
import LocalPlayerCharacter from './LocalPlayerCharacter';
import { PerfMetricsOverlay } from './PerfMetricsOverlay';

export type GameComponentProps = GameConnectedProps;

export const Systems: React.FC = () => {
  const { state } = useContext(GameContext);

  return (
    <AssetSystem>
      <WorldSystem>
        <AudioSystem>
          <MapRenderingSystem>
            <MapInteractionSystem>
              <ViewportSystem
                overlay={state.room ? <LocalPlayerCharacter /> : null}
              >
                <FootstepAudioSync />
                <KeyboardSystem />
                <TiledMap />
                <CharacterRenderingSystem />
              </ViewportSystem>
            </MapInteractionSystem>
          </MapRenderingSystem>
        </AudioSystem>
      </WorldSystem>
    </AssetSystem>
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
        <div
          id="game-debug-overlay"
          className="pointer-events-none absolute inset-0 z-10"
        />
        <GameStage width={App.canvasWidth} height={App.canvasHeight}>
          <Provider store={reduxContext.store}>
            <GameContext.Provider value={gameContext}>
              <ChatContext.Provider value={chatContext}>
                <Systems />
              </ChatContext.Provider>
            </GameContext.Provider>
          </Provider>
        </GameStage>
        <GameSettingsPanel />
        <ChatComponent />
        {gameContext.state.debug ? (
          <>
            <FpsView
              width={70}
              height={30}
              left={null}
              right={60}
              top={20}
              bottom={null}
            />
            <PerfMetricsOverlay />
          </>
        ) : null}
      </GameStyled>
    </GamePageShell>
  );
};

export default GameComponent;
