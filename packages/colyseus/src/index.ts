import { monitor } from '@colyseus/monitor';
import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path'

import { WorldRoom } from './rooms/WorldRoom';

const envPath = process.env.ENV_PATH || process.cwd()
dotenv.config({ path: path.resolve(envPath, '.env') })
const port = Number(process.env.PORT || 2567);
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

app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
