import { Client } from 'colyseus.js';

import { getBaoServerUrl } from './baoUrls';

export const createBaoClient = (): Client => new Client(getBaoServerUrl());
