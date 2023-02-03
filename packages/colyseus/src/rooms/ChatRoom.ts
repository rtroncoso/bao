import http from 'http';

import { Client, Presence, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@bao/server/commands/OnJoinChat';
import { OnLeaveCommand } from '@bao/server/commands/OnLeaveChat';
import { AuthService } from '@bao/server/services/AuthService';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { Message, MessageOptions } from '@bao/server/schema/MessageState';
import {
  OnMessageCommand,
  OnMessageParameters
} from '@bao/server/commands/OnMessage';
import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import { ArraySchema } from '@colyseus/schema';
import { throws } from 'assert';

export interface SendMessageParams {
  message: string;
  sessionId: string;
  character?: CharacterState;
  options?: MessageOptions;
}
export interface BroadcastMessageParams {
  message: string;
  character?: CharacterState;
  options?: MessageOptions;
}

export class ChatRoom extends Room<WorldRoomState> {
  characters = new ArraySchema<CharacterState>();
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    console.log(`chat:onCreate`);
    this.setState(new WorldRoomState());
    this.onMessage('message', (client, message: string) => {
      this.dispatcher.dispatch(new OnMessageCommand(), {
        message,
        client
      });
    });
  }

  public sendMessage({
    message,
    sessionId,
    character,
    options
  }: SendMessageParams) {
    const timestamp = Date.now();
    const client = this.clients.find(
      (client) => client.sessionId === sessionId
    );

    if (client) {
      this.send(
        client,
        new Message({
          character,
          message,
          timestamp,
          options
        })
      );
    }
  }

  public broadcastMessage({
    message,
    character,
    options
  }: BroadcastMessageParams) {
    const timestamp = Date.now();
    this.broadcast(
      new Message({
        character,
        message,
        timestamp,
        options
      })
    );
  }

  public async onAuth(
    client: Client,
    options: any,
    request: http.IncomingMessage
  ) {
    console.log(`chat:onAuth: ${client.sessionId}, ${client.id}`);
    return this.authService.authenticate(client, options, request);
  }

  public onJoin(client: Client, options: any) {
    console.log(`chat:onJoin: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnJoinCommand(), { client, options });
  }

  public async onLeave(client: Client, consented: boolean) {
    console.log(`chat:onLeave: ${client.sessionId}, ${client.id}`);
    this.dispatcher.dispatch(new OnLeaveCommand(), { client });
  }

  public onDispose() {
    console.log(`chat:onDispose`);
  }
}
