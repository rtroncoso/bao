import React, { useContext } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { Character } from 'src/components/Entities/Character';

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { serverState } = state;
  const { characters } = serverState || {};

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
