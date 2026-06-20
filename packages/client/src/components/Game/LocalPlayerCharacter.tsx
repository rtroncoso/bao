import React, { useContext, useEffect, useState } from 'react';

import { Character } from '@bao/client/components/Entities/Character';
import { GameContext } from '@bao/client/components/Game';
import {
  localCharacterRef,
  subscribeGamePatch
} from '@bao/client/lib/game-server-state';
import { App } from '@bao/core/constants';
import { CharacterState } from '@bao/server/schema/CharacterState';

/** Local player — reads live Colyseus schema; React updates only when join/leave. */
const LocalPlayerCharacter: React.FC = () => {
  const { state } = useContext(GameContext);
  const { room } = state;
  const [character, setCharacter] = useState<CharacterState | null>(null);

  useEffect(() => {
    if (!room) {
      setCharacter(null);
      return;
    }

    const sync = () => {
      const resolved = localCharacterRef.current;

      setCharacter((previous) => {
        if (resolved === previous) {
          return previous;
        }
        if (!resolved && !previous) {
          return previous;
        }
        return resolved;
      });
    };

    sync();
    return subscribeGamePatch(sync, ['characters']);
  }, [room]);

  if (!character) {
    return null;
  }

  return (
    <Character
      key={character.sessionId}
      character={character}
      isLocalPlayer
      x={App.canvasWidth / 2}
      y={App.canvasHeight / 2}
    />
  );
};

export default LocalPlayerCharacter;
