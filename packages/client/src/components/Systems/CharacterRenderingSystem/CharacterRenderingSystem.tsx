import { Container, Text } from '@inlet/react-pixi';
import React, { useContext } from 'react';

import { Rectangle } from '@/components/Pixi/Rectangle';
import { defaultTextStyle, GameContext } from '@bao/client/components/Game';
import { TILE_SIZE } from '@bao/core';

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { serverState } = state;
  const { characters } = serverState || {};

  if (characters) {
    return (
      <React.Fragment>
        {characters.map((character) => (
          <Container
            anchor={0.5}
            key={character.sessionId}
            x={character.x}
            y={character.y}
          >
            <Rectangle width={TILE_SIZE} height={TILE_SIZE} color={0xfa3520} />
            <Text
              anchor={[0.5, 0.5]}
              x={TILE_SIZE / 2}
              y={TILE_SIZE + TILE_SIZE / 2}
              text={character.name}
              style={defaultTextStyle}
            />
          </Container>
        ))}
      </React.Fragment>
    );
  }

  return null;
};
