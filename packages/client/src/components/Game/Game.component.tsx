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

export type GameComponentProps = GameConnectedProps;

export const Systems: React.FC = () => {
  return (
    <LayersStage enableSort>
      <AssetSystem>
        <KeyboardSystem />
        <MapRenderingSystem>
          <ViewportSystem>
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
  // useEffect(() => {
  //   const handleContextMenu = (
  //     event: Parameters<typeof document.addEventListener<'contextmenu'>>[1]
  //   ) => {
  //     event.preventDefault();
  //   };
  //   document.addEventListener('contextmenu', handleContextMenu);
  //   return function cleanup() {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //   };
  // }, []);

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
