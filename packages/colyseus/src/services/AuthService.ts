import { Client, Room } from 'colyseus';

import http from 'http';
import jwt from 'jsonwebtoken';

export class AuthService {
  protected room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  public async authenticate(client: Client, options: any, request: http.IncomingMessage) {
    const account = this.validateToken(options.token);
    options.account = account;
    return account;
  }

  public validateToken(token: string) {
    return jwt.verify(token, process.env.SECRET_KEY);
  }
}
