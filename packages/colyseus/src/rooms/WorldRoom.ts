import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@mob/server/commands/OnJoin';
import { OnLeaveCommand } from '@mob/server/commands/OnLeave';
import { MoveParameters, OnMoveCommand } from '@mob/server/commands/OnMove';
import { AuthService } from '@mob/server/services/AuthService';
import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export class WorldRoom extends Room {
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());

    this.onMessage('move', (client, message: MoveParameters) => {
      console.log(
        `received message move: ${client.sessionId} ${message.heading}`
      );
      this.dispatcher.dispatch(new OnMoveCommand(), {
        ...message,
        client
      });
    });
  }

  public async onAuth(
    client: Client,
    options: any,
    request: http.IncomingMessage
  ) {
    console.log(`onAuth: ${client.sessionId}, ${client.id}`);
    return this.authService.authenticate(client, options, request);
  }

  public onJoin(client: Client, options: any) {
    console.log(`onJoin: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnJoinCommand(), { client, options });
  }

  public onLeave(client: Client, consented: boolean) {
    console.log(`onLeave: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnLeaveCommand(), { client });
  }

  public onDispose() {
    console.log(`onDispose`);
  }
}
