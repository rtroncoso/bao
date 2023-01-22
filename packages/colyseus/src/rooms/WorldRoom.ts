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
import { MapSchema } from '@colyseus/schema';
import { TILE_SIZE } from '@mob/core';

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
    new Array(50).fill(0).forEach(() => {
      function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }
      const character = new CharacterState();
      character.sessionId = (Math.random() + 1).toString(36).substring(7);
      character.name = (Math.random() + 1).toString(36).substring(7);
      character.x = Math.floor(randomIntFromInterval(-20, 20) * TILE_SIZE);
      character.y = Math.floor(randomIntFromInterval(-20, 20) * TILE_SIZE);
      characters.set(character.sessionId, character);
    });
    new Array(10).fill(0).forEach((_, i) => {
      const character = new CharacterState();
      character.sessionId = (Math.random() + 1).toString(36).substring(7);
      character.name = (Math.random() + 1).toString(36).substring(7);
      character.x = Math.floor(i * TILE_SIZE);
      character.y = Math.floor(10 * TILE_SIZE);
      characters.set(character.sessionId, character);
    });

    this.state.characters = characters;
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
