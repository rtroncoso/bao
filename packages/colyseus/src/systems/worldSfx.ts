import { WORLD_SFX_MESSAGE, WorldSfxPayload } from '@bao/core/constants/audio';

import { WorldRoom } from '@/rooms/WorldRoom';

export const broadcastWorldSfx = (
  room: WorldRoom,
  payload: WorldSfxPayload
): void => {
  room.broadcast(WORLD_SFX_MESSAGE, payload);
};
