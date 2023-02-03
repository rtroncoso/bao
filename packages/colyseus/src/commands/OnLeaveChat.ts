import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { ChatRoom } from '@/rooms/ChatRoom';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<ChatRoom, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {}
}
