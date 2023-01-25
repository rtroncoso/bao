import { Container, Sprite, Text, useTick } from '@inlet/react-pixi';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getTexture, Graphic, TexturedGraphic, TILE_SIZE } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { defaultTextStyle, GameContext } from 'src/components/Game';
import { Animation, Rectangle } from 'src/components/Pixi';
import { HEADINGS } from '@bao/core';
import { useSelector } from 'react-redux';
import { selectBodies, selectHeads } from 'src/queries';
import { AnimatedSprite, Point } from 'pixi.js';
import { MovementSystem } from '@bao/server/systems';

export interface CharacterProps {
  character: CharacterState;
}

export const Character = ({ character }: CharacterProps) => {
  const bodyRef = useRef<AnimatedSprite>();
  const bodies = useSelector(selectBodies);
  const heads = useSelector(selectHeads);
  const heading = HEADINGS[character.heading];
  const body = character.bodyId && bodies[character.bodyId];
  const head = character.headId && heads[character.headId];

  const bodyOffset = useMemo(() => {
    if (body) {
      const direction = body[heading] as Graphic;

      if (direction) {
        const [frame] = direction.frames;
        const x = (TILE_SIZE - (frame as Graphic).width) / 2;
        const y = TILE_SIZE - (frame as Graphic).height;
        return new Point(x, y);
      }
    }

    return new Point();
  }, [body]);

  const headOffset = useMemo(() => {
    if (body) {
      return new Point(body.headOffsetX + 4, body.headOffsetY - 5);
    }

    return new Point();
  }, [body]);

  useTick(() => {
    if (character.isMoving && !bodyRef.current?.playing) {
      bodyRef.current?.gotoAndPlay(0);
    }

    if (!character.isMoving) {
      bodyRef.current?.gotoAndStop(0);
    }
  });

  return (
    <Container
      anchor={0.5}
      key={character.sessionId}
      x={character.x}
      y={character.y}
    >
      <Container x={bodyOffset.x} y={bodyOffset.y}>
        {body && Boolean(body[heading]) && (
          <>
            <Container x={headOffset.x} y={headOffset.y}>
              {head && Boolean(head[heading]) && (
                <Sprite texture={getTexture(head[heading])} />
              )}
            </Container>
            <Animation ref={bodyRef} animation={body[heading]} />
          </>
        )}
      </Container>
      <Text
        anchor={[0.5, 0.5]}
        x={TILE_SIZE / 2}
        y={TILE_SIZE + TILE_SIZE / 2}
        text={character.name}
        style={defaultTextStyle}
      />
    </Container>
  );
};
