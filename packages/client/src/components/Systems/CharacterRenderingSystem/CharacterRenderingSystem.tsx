import { Container, PixiComponent, Text } from '@inlet/react-pixi';
import { Graphics } from 'pixi.js';
import React, { useContext } from 'react';

import { CharacterState } from '@mob/server/schema/CharacterState';
import { defaultTextStyle, GameContext } from '@mob/client/components/Game';

interface RectangleProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  color: number;
}

const Rectangle = PixiComponent<RectangleProps, Graphics>('Rectangle', {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    ins.x = props.x || 0;
    ins.y = props.y || 0;
    ins.clear();
    ins.beginFill(props.color);
    ins.drawRect(ins.x, ins.y, props.width, props.height);
    ins.endFill();
  },
});

export const CharacterRenderingSystem: React.FC = () => {
  const { state } = useContext(GameContext);
  const { gameState } = state!;

  if (
    gameState &&
    gameState.characters &&
    Object.values(gameState.characters).length
  ) {
    return (
      <React.Fragment>
        {Object.values(gameState.characters)
          .map((character: CharacterState) => (
            <Container
              key={character.sessionId}
              x={character.x}
              y={character.y}
            >
              <Rectangle
                width={100}
                height={100}
                color={0xff0000}
              />
              <Text
                y={105}
                text={character.name}
                style={defaultTextStyle}
              />
            </Container>
          ))
        }
      </React.Fragment>
    );
  }

  return null;
}
