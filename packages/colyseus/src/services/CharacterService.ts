import axios from 'axios';

import { config } from '@/config';

export interface CharacterPositionPayload {
  mapId: number;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
}

export class CharacterService {
  async updatePosition(
    characterId: number,
    accountId: number,
    payload: CharacterPositionPayload
  ): Promise<void> {
    const headers: Record<string, string> = {};

    if (process.env.ADMIN_API_KEY) {
      headers['x-admin-key'] = process.env.ADMIN_API_KEY;
    }

    await axios.patch(
      `${config.apiBaseUrl}/admin/characters/${characterId}/position`,
      {
        accountId,
        ...payload
      },
      { headers }
    );
  }
}
