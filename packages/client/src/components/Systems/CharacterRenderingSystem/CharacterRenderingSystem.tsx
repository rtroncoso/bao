import React, { useContext } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { Character } from 'src/components/Entities/Character';

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { serverState, characterId, room } = state;
  const { characters } = serverState || {};
  const localCharacter = resolveLocalCharacter(
    serverState,
    characterId,
    room?.sessionId
  );

  if (characters) {
    return (
      <React.Fragment>
        {characters
          .filter(
            (character) =>
              character.sessionId !== localCharacter?.sessionId
          )
          .map((character) => (
            <Character key={character.sessionId} character={character} />
          ))}
      </React.Fragment>
    );
  }

  return null;
};
