import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@bao/server/commands/OnJoin';
import { InputParameters, OnInputCommand } from '@bao/server/commands/OnInput';
import { OnLeaveCommand } from '@bao/server/commands/OnLeave';
import { AuthService } from '@bao/server/services/AuthService';
import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import { MovementSystem } from '@bao/server/systems';
import { CharacterState } from '@/schema/CharacterState';
import { ArraySchema } from '@colyseus/schema';
import { TILE_SIZE } from '@bao/core';

export class WorldRoom extends Room<WorldRoomState> {
  movementSystem: MovementSystem;
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);

  public onCreate(options: any) {
    this.setState(new WorldRoomState());
    this.movementSystem = new MovementSystem(this);
    this.setSimulationInterval(this.update);

    this.onMessage('input', (client, message: InputParameters) => {
      this.dispatcher.dispatch(new OnInputCommand(), {
        ...message,
        client
      });
    });

    const characters = new ArraySchema<CharacterState>(
      ...new Array(50).fill(0).map(() => {
        function randomIntFromInterval(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const character = new CharacterState();
        character.sessionId = (Math.random() + 1).toString(36).substring(7);
        character.name = (Math.random() + 1).toString(36).substring(7);
        character.x = Math.floor(randomIntFromInterval(-20, 20) * TILE_SIZE);
        character.y = Math.floor(randomIntFromInterval(-20, 20) * TILE_SIZE);
        return character;
      }),
      ...new Array(10).fill(0).map((_, i) => {
        const character = new CharacterState();
        character.sessionId = (Math.random() + 1).toString(36).substring(7);
        character.name = (Math.random() + 1).toString(36).substring(7);
        character.x = Math.floor(i * TILE_SIZE);
        character.y = Math.floor(10 * TILE_SIZE);

        this.clock.setInterval(() => {
          character.inputs = character.inputs.includes('w')
            ? new ArraySchema('s')
            : new ArraySchema('w');
        }, 500);

        return character;
      }),
      ...new Array(10).fill(0).map((_, i) => {
        const character = new CharacterState();
        character.sessionId = (Math.random() + 1).toString(36).substring(7);
        character.name = (Math.random() + 1).toString(36).substring(7);
        character.x = Math.floor(i * TILE_SIZE);
        character.y = Math.floor(7 * TILE_SIZE);

        this.clock.setInterval(() => {
          character.inputs = character.inputs.includes('s')
            ? new ArraySchema('w')
            : new ArraySchema('s');
        }, 500);

        return character;
      })
    );

    this.state.characters = characters;
  }

  public update = (deltaTime: number) => {
    this.movementSystem.update(deltaTime);
  };

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
