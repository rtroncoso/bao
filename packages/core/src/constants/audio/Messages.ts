/** Colyseus broadcast when a positional SFX should play for nearby clients. */
export const WORLD_SFX_MESSAGE = 'worldSfx';

export interface WorldSfxPayload {
  sfxId: string;
  mapId: number;
  x: number;
  y: number;
}
