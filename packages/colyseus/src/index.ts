import { monitor } from '@colyseus/monitor';
import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { WorldRoom } from './rooms/WorldRoom';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server
});

gameServer.define('world', WorldRoom);

app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
