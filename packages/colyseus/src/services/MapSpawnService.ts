import axios, { type AxiosResponse } from 'axios';

import { config } from '@/config';

export interface MapSpawnNpc {
  id: number;
  mapId: number;
  npcId: number;
  x: number;
  y: number;
  bodyId: number;
  headId: number;
  heading: number;
}

export interface MapSpawnObject {
  id: number;
  mapId: number;
  objectId: number;
  amount: number;
  x: number;
  y: number;
  graphicId: number;
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
    let url: string;

    if (authToken) {
      headers['x-auth'] = authToken;
      url = `${config.apiBaseUrl}/client/maps/${mapId}/spawns`;
    } else if (process.env.ADMIN_API_KEY) {
      headers['x-admin-key'] = process.env.ADMIN_API_KEY;
      url = `${config.apiBaseUrl}/admin/maps/${mapId}/spawns`;
    } else {
      throw new Error(
        'Map spawns require a player token or ADMIN_API_KEY in .env'
      );
    }

    const response = (await axios.get(url, {
      headers
    })) as unknown as AxiosResponse<MapSpawnsResponse>;
    return response.data;
  }
}
