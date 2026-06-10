import axios from 'axios';

import { config } from '@/config';

export interface MapSpawnNpc {
  id: number;
  mapId: number;
  npcId: number;
  x: number;
  y: number;
}

export interface MapSpawnObject {
  id: number;
  mapId: number;
  objectId: number;
  amount: number;
  x: number;
  y: number;
}

export interface MapSpawnsResponse {
  map: { id: number; name: string };
  npcs: MapSpawnNpc[];
  objects: MapSpawnObject[];
  tileExits: Array<{
    id: number;
    mapId: number;
    x: number;
    y: number;
    targetMapId: number;
    targetX: number;
    targetY: number;
  }>;
}

export class MapSpawnService {
  async fetchSpawns(
    mapId: number,
    authToken?: string
  ): Promise<MapSpawnsResponse> {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['x-auth'] = authToken;
    } else if (process.env.ADMIN_API_KEY) {
      headers['x-admin-key'] = process.env.ADMIN_API_KEY;
    }

    return axios.get<MapSpawnsResponse>(
      `${config.apiBaseUrl}/admin/maps/${mapId}/spawns`,
      { headers }
    );
  }
}
