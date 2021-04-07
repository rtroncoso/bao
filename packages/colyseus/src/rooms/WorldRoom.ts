import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@mob/server/commands/OnJoin';
import { InputParameters, OnInputCommand } from '@mob/server/commands/OnInput';
import { OnLeaveCommand } from '@mob/server/commands/OnLeave';
import { AuthService } from '@mob/server/services/AuthService';
import { WorldRoomState } from '@mob/server/schema/WorldRoomState';
import { MovementSystem } from '@mob/server/systems';

export class WorldRoom extends Room {
  movementSystem: MovementSystem
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());
    this.movementSystem = new MovementSystem(this);

    this.onMessage('input', (client, message: InputParameters) => {
      this.dispatcher.dispatch(new OnInputCommand, {
        ...message,
        client
      });
    });
  }

  public async onAuth(client: Client, options: any, request: http.IncomingMessage) {
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
