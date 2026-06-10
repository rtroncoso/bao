import http from 'http';

import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';
import { ArraySchema } from '@colyseus/schema';

import { OnJoinCommand } from '@bao/server/commands/OnJoinWorld';
import { InputParameters, OnInputCommand } from '@bao/server/commands/OnInput';
import { OnLeaveCommand } from '@bao/server/commands/OnLeaveWorld';
import { AuthService } from '@bao/server/services/AuthService';
import { MapRegistry } from '@bao/server/services/MapRegistry';
import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import { MapEntitySystem } from '@bao/server/systems/MapEntitySystem';
import { MapTransitionSystem } from '@bao/server/systems/MapTransitionSystem';
import { MovementSystem } from '@bao/server/systems';
import { CharacterState } from '@/schema/CharacterState';

export class WorldRoom extends Room<WorldRoomState> {
  movementSystem: MovementSystem;
  mapEntitySystem: MapEntitySystem;
  mapRegistry: MapRegistry;
  mapTransitionSystem: MapTransitionSystem;
  authService: AuthService = new AuthService(this);
  dispatcher = new Dispatcher(this);
  accountIdBySession = new Map<string, number>();
  authTokenBySession = new Map<string, string>();

  public onCreate(options: any) {
    this.setState(new WorldRoomState());
    this.movementSystem = new MovementSystem(this);
    this.mapEntitySystem = new MapEntitySystem(this);
    this.mapRegistry = new MapRegistry(this);
    this.mapTransitionSystem = new MapTransitionSystem(this, this.mapRegistry);
    this.state.characters = new ArraySchema<CharacterState>();
    this.setSimulationInterval(this.update);

    this.onMessage('input', (client, message: InputParameters) => {
      this.dispatcher.dispatch(new OnInputCommand(), {
        ...message,
        client
      });
    });
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

  public async onJoin(client: Client, options: any, auth: any) {
    console.log(`onJoin: ${client.sessionId}, ${client.id}`);
    await this.dispatcher.dispatch(new OnJoinCommand(), {
      client,
      options,
      auth
    });
  }

  public async onLeave(client: Client, consented: boolean) {
    console.log(`onLeave: ${client.sessionId}, ${client.id}`);
    await this.dispatcher.dispatch(new OnLeaveCommand(), { client });
  }

  public onDispose() {
    console.log(`onDispose`);
  }
}
