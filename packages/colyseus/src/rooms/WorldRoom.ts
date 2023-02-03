import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from '@bao/server/commands/OnJoinWorld';
import { InputParameters, OnInputCommand } from '@bao/server/commands/OnInput';
import { OnLeaveCommand } from '@bao/server/commands/OnLeaveWorld';
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
      ...new Array(100).fill(0).map(() => {
        function randomIntFromInterval(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const character = new CharacterState();
        character.sessionId = (Math.random() + 1).toString(36).substring(7);
        character.x = character.tile.x * TILE_SIZE;
        character.y = character.tile.y * TILE_SIZE;
        character.bodyId = 2;
        character.headId = 5;
        character.moveTo(
          randomIntFromInterval(25, 75),
          randomIntFromInterval(25, 75)
        );
        return character;
      }),
      ...new Array(10).fill(0).map((_, i) => {
        const character = new CharacterState();
        character.sessionId = (Math.random() + 1).toString(36).substring(7);
        character.moveTo(i + 25, 60);
        character.bodyId = 3;
        character.headId = 4;

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
        character.moveTo(i + 25, 65);
        character.bodyId = 23;
        character.headId = 2;

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
