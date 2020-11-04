import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { WorldRoomState } from './schema/WorldRoomState';
import { OnJoinCommand } from './commands/OnJoin';
import { OnLeaveCommand } from './commands/OnLeave';
import { OnMoveCommand } from './commands/OnMove';

export type Heading = 'north' | 'east' | 'south' | 'west';
interface MoveParameters {
  heading: Heading;
}

export class WorldRoom extends Room {
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());

    this.onMessage('move', (client, message: MoveParameters) => {
      console.log(`received message move: ${client.sessionId} ${message.heading}`);
      const { heading } = message;
      this.dispatcher.dispatch(new OnMoveCommand, { client, heading });
    });
  }

  public onJoin(client: Client, options: any) {
    console.log(`client joined: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnJoinCommand(), { client });
  }

  public onLeave(client: Client, consented: boolean) {
    console.log(`client left: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnLeaveCommand(), { client });
  }

  public onDispose() {
    console.log(`onDispose`);
  }
}
