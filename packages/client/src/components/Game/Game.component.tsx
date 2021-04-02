import { Container, PixiComponent, Stage, Text } from '@inlet/react-pixi';
import { Client, Room } from 'colyseus.js';
import { Graphics, TextStyle } from 'pixi.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ConnectedProps } from './Game.container';
import { useKeyPress } from './Game.hooks';

export type GameProps =
  ConnectedProps;

interface RectangleProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  color: number;
}

interface GameComponentState {
  characterId: number;
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

const style = new TextStyle({
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontSize: 16,
  fill: ['#ffffff', '#00ff99'],
  align: 'center',
  stroke: '#4a1850'
});

const Game: React.FC<GameProps> = ({
  token
}) => {
  const location = useLocation<GameComponentState>();
  const [client, setClient] = useState<Client | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [characters, setCharacters] = useState<any>(null);

  const joinWorld = useCallback(async (client) => {
    try {
      const room = await client.joinOrCreate('world', {
        characterId: location.state.characterId,
        token
      });
      setRoom(room);

      room.onStateChange((state: any) => {
        if (state.characters) {
          setCharacters(state.characters.toJSON());
        }
      });

      room.onError((error: any) => { throw error })
    } catch(err) {
      console.error(`Error from server: ${JSON.stringify(err, null, 2)}`);
    }
  }, [location, token]);

  useEffect(() => {
    const connection = new Client(process.env.MOB_SERVER);
    setClient(connection);
    joinWorld(connection);
  }, [joinWorld]);

  const isNorthPressed = useKeyPress('w');
  const isEastPressed = useKeyPress('d');
  const isSouthPressed = useKeyPress('s');
  const isWestPressed = useKeyPress('a');

  if (isNorthPressed) {
    if (room) {
      room.send('move', { heading: 'north' });
    }
  }
  if (isEastPressed) {
    if (room) {
      room.send('move', { heading: 'east' });
    }
  }
  if (isSouthPressed) {
    if (room) {
      room.send('move', { heading: 'south' });
    }
  }
  if (isWestPressed) {
    if (room) {
      room.send('move', { heading: 'west' });
    }
  }

  return (
    <div className="Game">
      {client ? (
        <Stage width={1600} height={900}>
          {room && characters && Object.values(characters).length ? Object.values(characters).map((character: any) => (
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
                style={style}
              />
            </Container>
          )) : null}
        </Stage>
      ) : null}
    </div>
  );
}

export default Game;
