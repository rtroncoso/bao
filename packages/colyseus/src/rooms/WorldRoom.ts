import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';
import { OnJoinCommand } from '@mob/server/commands/OnJoin';
import { OnLeaveCommand } from '@mob/server/commands/OnLeave';
import { MoveParameters, OnMoveCommand } from '@mob/server/commands/OnMove';

export class WorldRoom extends Room {
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());

    this.onMessage('move', (client, message: MoveParameters) => {
      console.log(`received message move: ${client.sessionId} ${message.heading}`);
      this.dispatcher.dispatch(new OnMoveCommand, {
        ...message,
        client
      });
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
