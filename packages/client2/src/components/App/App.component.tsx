import { PixiComponent, Stage } from '@inlet/react-pixi';
import { Client, Room } from 'colyseus.js';
import { Graphics } from 'pixi.js';
import React, { useCallback, useEffect, useState } from 'react';

import { useKeyPress } from './App.hooks';
import './App.scss';

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

const Rectangle = PixiComponent<RectangleProps, Graphics>('Rectangle', {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    ins.x = props.x;
    ins.y = props.y;
    ins.clear();
    ins.beginFill(props.color);
    ins.drawRect(props.x, props.y, props.width, props.height);
    ins.endFill();
  },
})

const App = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<any>(null);

  const joinWorld = useCallback(async (client) => {
    const room = await client.joinOrCreate('world');
    setRoom(room);

    room.onStateChange((state: any) => {
      console.log(state.players.toJSON());
      setPlayers(state.players.toJSON());
    });
  }, []);

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
    <div className="App">
      <header className="App-header">
        {client ? (
          <Stage width={1600} height={900}>
            {room && players && Object.values(players).length ? Object.values(players).map((player: any) => (
              <Rectangle key={player.sessionId} x={player.x} y={player.y} width={100} height={100} color={0xff0000} />
            )) : null}
          </Stage>
        ) : null}
      </header>
    </div>
  );
}

export default App;
