import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@mob/server/commands/OnJoin';
import { InputParameters, OnInputCommand } from '@mob/server/commands/OnInput';
import { OnLeaveCommand } from '@mob/server/commands/OnLeave';
import { AuthService } from '@mob/server/services/AuthService';
import { WorldRoomState } from '@mob/server/schema/WorldRoomState';
import { MovementSystem } from '@mob/server/systems';
import { CharacterState } from '@/schema/CharacterState';
import { ArraySchema, MapSchema } from '@colyseus/schema';

export class WorldRoom extends Room {
  movementSystem: MovementSystem;
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());
    this.movementSystem = new MovementSystem(this);

    this.onMessage('input', (client, message: InputParameters) => {
      this.dispatcher.dispatch(new OnInputCommand(), {
        ...message,
        client
      });
    });

    const characters = new MapSchema<CharacterState>();
    new Array(100).fill(0).forEach(() => {
      function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }
      const character = new CharacterState();
      character.sessionId = (Math.random() + 1).toString(36).substring(7);
      character.name = (Math.random() + 1).toString(36).substring(7);
      character.x = randomIntFromInterval(-1000, 1000);
      character.y = randomIntFromInterval(-1000, 1000);
      characters.set(character.sessionId, character);
    });

    this.state.characters = characters;
    console.log(this.state);
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
