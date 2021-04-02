import React, { useContext } from 'react';

import { GameContext } from '@mob/client/components/Game';

export interface ViewportProps {
  children?: React.ReactNode;
}

export const ViewportSystem: React.FC<ViewportProps> = (props: ViewportProps) => {
  const { children } = props;
  const { state } = useContext(GameContext);
  const { gameState } = state!;
  console.log(gameState);

  return children as React.ReactElement;
}
