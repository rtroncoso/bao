import { Sprite, Text } from '@inlet/react-pixi';
import { Container, useTick } from '@inlet/react-pixi';
import { Ease } from 'pixi-ease';
import {
  AnimatedSprite,
  Container as PixiContainer,
  Point,
  Text as PixiText
} from 'pixi.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import lerp from 'lerp';

import {
  CHARACTER_CHAT_STYLES,
  CHARACTER_NAME_STYLES,
  CHARACTER_TYPE,
  ENTITIES_LAYER,
  getTexture,
  Graphic,
  HEADINGS,
  roles,
  TILE_SIZE
} from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { Animation } from '@bao/client/components/Pixi';
import { selectBodies, selectHeads } from '@bao/client/queries';
import { useMapContext } from '@bao/client/components/Systems';
import { useChatContext } from 'src/components/Chat';

export interface CharacterProps {
  character: CharacterState;
}

export const Character = ({ character }: CharacterProps) => {
  const { mapState } = useMapContext();
  const { state: chatState } = useChatContext();
  const bodyRef = useRef<AnimatedSprite>();
  const container = useRef<PixiContainer>();
  const chatMessageRef = useRef<PixiText>();
  const bodies = useSelector(selectBodies);
  const heads = useSelector(selectHeads);
  const heading = HEADINGS[character.heading];
  const body = character.bodyId && bodies[character.bodyId];
  const head = character.headId && heads[character.headId];
  const easing = useMemo(() => new Ease({}), []);
  const chatStyle = useMemo(() => CHARACTER_CHAT_STYLES[roles.admin], []);
  const nameStyle = useMemo(() => CHARACTER_NAME_STYLES[roles.admin], []);
  const [chatTimeoutId, setChatTimeoutId] = useState<NodeJS.Timeout>();

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

  useEffect(() => {
    container.current.x = character.x;
    container.current.y = character.y;
  }, []);

  useTick(() => {
    const x = lerp(container.current.x, character.x, 1 / 3);
    const y = lerp(container.current.y, character.y, 1 / 3);
    container.current.x = x;
    container.current.y = y;
  });

  const lastMessage = useMemo(() => {
    const messages = [...chatState.messages].reverse();
    const [message] = messages.filter((message) =>
      message.character ? message.character?.id === character.id : false
    );
    return message;
  }, [chatState.messages.length]);

  useEffect(() => {
    if (lastMessage && chatMessageRef.current) {
      if (chatTimeoutId) clearTimeout(chatTimeoutId);
      easing.removeAll();
      chatMessageRef.current.y = headOffset.y;
      chatMessageRef.current.alpha = 0;

      easing.add(
        chatMessageRef.current,
        { y: headOffset.y - 4 - TILE_SIZE / 2, alpha: 1 },
        { duration: 300 }
      );

      const timeoutId = setTimeout(() => {
        easing.add(
          chatMessageRef.current,
          { y: headOffset.y, alpha: 0 },
          { duration: 300 }
        );
      }, 3000);
      setChatTimeoutId(timeoutId);
    }
  }, [lastMessage, chatMessageRef.current]);

  return (
    <Container
      ref={container}
      accessibleType={CHARACTER_TYPE}
      parentGroup={mapState.groups[ENTITIES_LAYER]}
      key={character.sessionId}
      anchor={0.5}
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
      {lastMessage && (
        <Text
          ref={chatMessageRef}
          anchor={[0.5, 1.0]}
          x={TILE_SIZE / 2}
          text={lastMessage.message}
          style={{
            ...chatStyle,
            breakWords: true,
            wordWrapWidth: 200,
            wordWrap: true,
            trim: true
          }}
        />
      )}
      {character.name && (
        <Text
          anchor={[0.5, 0]}
          x={TILE_SIZE / 2}
          y={TILE_SIZE}
          text={`${character.name}\n<Game Master>`}
          style={nameStyle}
        />
      )}
    </Container>
  );
};
