import { config, validateConfig } from './config'

import { monitor } from '@colyseus/monitor';
import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { ChatRoom, WorldRoom } from './rooms';

validateConfig();
const port = config.port;
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
  pingInterval: 2000,
  pingMaxRetries: 15
});

// gameServer.simulateLatency(50);
gameServer.define('world', WorldRoom);
gameServer.define('chat', ChatRoom);

app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
