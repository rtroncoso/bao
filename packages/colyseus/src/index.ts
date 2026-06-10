import { config, validateConfig } from './config'
import { buildExpressCorsOptions, patchMatchmakeCors } from './cors'

import { monitor } from '@colyseus/monitor';
import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { ChatRoom, WorldRoom } from './rooms';

validateConfig();
const port = config.port;
const app = express();

app.use(cors(buildExpressCorsOptions(config.corsOrigins)));
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
  pingInterval: 2000,
  pingMaxRetries: 15,
  verifyClient: config.corsOrigins
    ? (info, callback) => {
        const origin = info.origin;
        if (!origin || config.corsOrigins!.includes(origin)) {
          callback(true);
        } else {
          callback(false, 403, 'Forbidden');
        }
      }
    : undefined,
});

patchMatchmakeCors(gameServer, config.corsOrigins);

// gameServer.simulateLatency(50);
gameServer.define('world', WorldRoom);
gameServer.define('chat', ChatRoom);

app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
