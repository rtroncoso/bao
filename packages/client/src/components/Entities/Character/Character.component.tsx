import { Container, Sprite, Text, useTick } from '@inlet/react-pixi';
import React, { useMemo, useRef } from 'react';

import {
  CHARACTER_TYPE,
  ENTITIES_LAYER,
  getTexture,
  Graphic,
  TILE_SIZE
} from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { defaultTextStyle } from 'src/components/Game';
import { Animation } from 'src/components/Pixi';
import { HEADINGS } from '@bao/core';
import { useSelector } from 'react-redux';
import { selectBodies, selectHeads } from 'src/queries';
import { AnimatedSprite, Point } from 'pixi.js';
import { useMapContext } from '@/components/Systems/MapRenderingSystem/MapRenderingSystem';

export interface CharacterProps {
  character: CharacterState;
}

export const Character = ({ character }: CharacterProps) => {
  const { mapState } = useMapContext();
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
      accessibleType={CHARACTER_TYPE}
      parentGroup={mapState.groups[ENTITIES_LAYER]}
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
      {character.name && (
        <Text
          anchor={[0.5, 0.5]}
          x={TILE_SIZE / 2}
          y={TILE_SIZE + TILE_SIZE / 2}
          text={character.name}
          style={defaultTextStyle}
        />
      )}
    </Container>
  );
};
