import React, { useContext, useEffect, useState } from 'react';

import { GameContext } from '@bao/client/components/Game';
import {
  gameRoomRef,
  localCharacterRef,
  subscribeGamePatch
} from '@bao/client/lib/game-server-state';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { Character } from 'src/components/Entities/Character';

const sameCharacterList = (
  previous: CharacterState[],
  next: CharacterState[]
): boolean =>
  previous.length === next.length &&
  previous.every(
    (character, index) => character.sessionId === next[index]?.sessionId
  );

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { room } = state;
  const [remoteCharacters, setRemoteCharacters] = useState<CharacterState[]>(
    []
  );

  useEffect(() => {
    if (!room) {
      setRemoteCharacters([]);
      return;
    }

    const syncCharacterList = () => {
      const local = localCharacterRef.current;
      const remotes: CharacterState[] = [];

      for (const character of gameRoomRef.current?.state?.characters ?? []) {
        if (character.sessionId && character.sessionId !== local?.sessionId) {
          remotes.push(character);
        }
      }

      setRemoteCharacters((previous) =>
        sameCharacterList(previous, remotes) ? previous : remotes
      );
    };

    syncCharacterList();
    return subscribeGamePatch(syncCharacterList, ['characters']);
  }, [room]);

  return (
    <>
      {remoteCharacters.map((character) => (
        <Character
          key={character.sessionId ?? String(character.id)}
          character={character}
        />
      ))}
    </>
  );
};
