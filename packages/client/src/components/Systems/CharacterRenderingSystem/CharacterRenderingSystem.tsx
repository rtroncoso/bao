import React, { useContext, useMemo } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { Character } from 'src/components/Entities/Character';

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { serverState } = state;
  const { characters } = serverState || {};
  // const characters = useMemo(() => {
  //   return serverState.characters.sort((a, b) => a.tile.y - b.tile.y);
  // }, [serverState.characters]);

  if (characters) {
    return (
      <React.Fragment>
        {characters.map((character) => (
          <Character key={character.sessionId} character={character} />
        ))}
      </React.Fragment>
    );
  }

  return null;
};
