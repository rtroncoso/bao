import express from 'express';
import socket from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import Sequelize from 'sequelize';

import Protocol from './protocol';

export default class Game {
  constructor() {
    this.app = express();
    // this.app.use('/', express.static(path.resolve('dist')));
    // this.server = http.Server(this.app);
    // this.server.listen(2001);

    this.SOCKET_LIST = {};
    this.PLAYER_LIST = {};

    // socket
    this.io = socket(this.server, {});

    // Database
    this.sequelize = new Sequelize('mob', 'root', '', {
      host: 'localhost',
      dialect: 'mysql',
      operatorsAliases: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    this.protocol = new Protocol(this);
  }
}
