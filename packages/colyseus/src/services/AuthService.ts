import { Client, Room, ServerError } from 'colyseus';
import http from 'http';
import jwt from 'jsonwebtoken';

import { config } from '../config';

export interface AuthOptions {
  token?: string;
  account?: jwt.JwtPayload | string;
  characterId?: string | number;
}

export class AuthService {
  protected room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  public async authenticate(
    client: Client,
    options: AuthOptions,
    request: http.IncomingMessage
  ) {
    if (!options.token) {
      throw new ServerError(401, 'NOT_AUTHORIZED');
    }

    const account = this.validateToken(options.token);
    options.account = account;
    return account;
  }

  public validateToken(token: string) {
    if (!config.jwtSecret) {
      throw new ServerError(500, 'JWT_SECRET is not configured');
    }

    return jwt.verify(token, config.jwtSecret);
  }
}
