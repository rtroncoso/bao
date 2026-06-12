import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Sprite, Text } from '@inlet/react-pixi';
import { Ease } from 'pixi-ease';
import { Point, Rectangle, Text as PixiText } from 'pixi.js';
import { useSelector } from 'react-redux';

import {
  CHARACTER_CHAT_STYLES,
  getTexture,
  Graphic,
  HEADINGS,
  roles,
  TILE_SIZE
} from '@bao/core';
import { Animation } from '@bao/client/components/Pixi';
import { useMapContext } from '@bao/client/components/Systems';
import { useMapInteractionContext } from '@bao/client/components/Systems/MapInteractionSystem';
import { selectBodies, selectHeads } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { ENTITIES_LAYER } from '@bao/core/constants/game/Map';

export interface MapNpcEntityProps {
  id: string;
  bodyId: number;
  headId: number;
  heading: number;
  description?: string;
  x: number;
  y: number;
  onClick?: () => void;
}

export const MapNpcEntity: React.FC<MapNpcEntityProps> = ({
  id,
  bodyId,
  headId,
  heading,
  description,
  x,
  y,
  onClick
}) => {
  const { mapState } = useMapContext();
  const { headDisplayByNpcId } = useMapInteractionContext();
  const bodies = useSelector((state: State) => selectBodies(state));
  const heads = useSelector((state: State) => selectHeads(state));
  const headingKey = HEADINGS[heading];
  const body = bodyId ? bodies[bodyId] : undefined;
  const head = headId ? heads[headId] : undefined;
  const bodyDirection = body?.[headingKey] as Graphic | undefined;
  const headDirection = head?.[headingKey] as Graphic | undefined;
  const chatMessageRef = useRef<PixiText>();
  const easing = useMemo(() => new Ease({}), []);
  const chatStyle = useMemo(() => CHARACTER_CHAT_STYLES[roles.user], []);
  const [chatTimeoutId, setChatTimeoutId] = useState<NodeJS.Timeout>();

  const headDisplay = headDisplayByNpcId[id];

  const bodyOffset = useMemo(() => {
    if (!bodyDirection) {
      return new Point();
    }

    const [frame] = bodyDirection.frames;
    if (!(frame instanceof Graphic)) {
      return new Point();
    }

    return new Point((TILE_SIZE - frame.width) / 2, TILE_SIZE - frame.height);
  }, [bodyDirection]);

  const headOffset = useMemo(() => {
    if (!body) {
      return new Point();
    }

    return new Point(body.headOffsetX + 4, body.headOffsetY - 5);
  }, [body]);

  useEffect(() => {
    if (!chatMessageRef.current || headDisplay === undefined) {
      return;
    }

    if (chatTimeoutId) {
      clearTimeout(chatTimeoutId);
    }
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

  if (!bodyDirection) {
    return null;
  }

  const headTexture =
    headDirection instanceof Graphic ? getTexture(headDirection) : null;

  return (
    <Container
      key={id}
      parentGroup={mapState?.groups[ENTITIES_LAYER]}
      x={x * TILE_SIZE}
      y={y * TILE_SIZE}
      interactive={Boolean(onClick && description)}
      pointerdown={onClick}
      hitArea={new Rectangle(0, 0, TILE_SIZE, TILE_SIZE)}
    >
      <Container x={bodyOffset.x} y={bodyOffset.y}>
        {headTexture && (
          <Container x={headOffset.x} y={headOffset.y}>
            <Sprite texture={headTexture} />
          </Container>
        )}
        <Animation animation={bodyDirection} />
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
    </Container>
  );
};
