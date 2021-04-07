import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { ArraySchema } from '@colyseus/schema';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export interface InputParameters {
  inputs: Array<string>;
}

export interface OnInputParameters {
  client: Client;
  inputs: Array<string>;
}

export class OnInputCommand extends Command<WorldRoomState, OnInputParameters> {
  execute({ client, inputs }: OnInputParameters) {
    console.log(`received message input: ${client.sessionId} ${inputs}`);
    const character = this.state.characters.get(client.sessionId);
    if (character) {
      character.inputs = new ArraySchema(...inputs);
    }
  }
}
