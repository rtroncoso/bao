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
import { useMapContext } from '@bao/client/components/Systems/MapRenderingSystem';
import {
  getMapWorldOffset,
  useWorldContext
} from '@bao/client/components/Systems/WorldSystem';
import { useInterpolatedPosition } from '@bao/client/hooks';
import { useChatContext } from 'src/components/Chat';

export interface CharacterProps {
  character: CharacterState;
  isLocalPlayer?: boolean;
  x?: number;
  y?: number;
}

export const Character = ({
  character,
  isLocalPlayer = false,
  x: fixedX,
  y: fixedY
}: CharacterProps) => {
  const { mapState } = useMapContext();
  const { worlds } = useWorldContext();
  const { state: chatState } = useChatContext();
  const mapOffset = useMemo(
    () => getMapWorldOffset(character.mapId ?? 34, worlds),
    [character.mapId, worlds]
  );
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

  const positionRef = useInterpolatedPosition(
    character.x,
    character.y,
    !isLocalPlayer
  );

  useTick(() => {
    if (character.isMoving && !bodyRef.current?.playing) {
      bodyRef.current?.gotoAndPlay(0);
    }

    if (!character.isMoving) {
      bodyRef.current?.gotoAndStop(0);
    }

    if (isLocalPlayer) {
      return;
    }

    const node = container.current;
    if (!node?.parent) {
      return;
    }

    node.x = positionRef.current.x + mapOffset.x;
    node.y = positionRef.current.y + mapOffset.y;
  });

  const headDisplay = character.sessionId
    ? chatState.headDisplayBySession[character.sessionId]
    : undefined;

  useEffect(() => {
    if (!chatMessageRef.current || headDisplay === undefined) {
      return;
    }

    if (chatTimeoutId) clearTimeout(chatTimeoutId);
    easing.removeAll();

    if (!headDisplay.text) {
      easing.add(
        chatMessageRef.current,
        { y: headOffset.y, alpha: 0 },
        { duration: 300 }
      );
      return;
    }

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
  }, [headDisplay?.token, headOffset.y]);

  return (
    <Container
      ref={container}
      accessibleType={CHARACTER_TYPE}
      parentGroup={mapState.groups[ENTITIES_LAYER]}
      key={character.sessionId}
      anchor={0.5}
      x={isLocalPlayer ? fixedX : undefined}
      y={isLocalPlayer ? fixedY : undefined}
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
      {headDisplay !== undefined && (
        <Text
          ref={chatMessageRef}
          anchor={[0.5, 1.0]}
          x={TILE_SIZE / 2}
          text={headDisplay.text}
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
