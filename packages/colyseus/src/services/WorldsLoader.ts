import fs from 'fs';
import path from 'path';

import {
  getPrefetchMapIds,
  getQuadrant,
  WorldsJson
} from '@bao/core/loaders/maps/world';

const DEFAULT_WORLDS_PATH = path.resolve(
  __dirname,
  '../../../assets/public/worlds/worlds.json'
);

export class WorldsLoader {
  private worlds: WorldsJson | null = null;

  load(worldsPath: string = DEFAULT_WORLDS_PATH): WorldsJson | null {
    if (this.worlds) {
      return this.worlds;
    }

    if (!fs.existsSync(worldsPath)) {
      console.warn(`[WorldsLoader] worlds.json not found at ${worldsPath}`);
      return null;
    }

    this.worlds = JSON.parse(fs.readFileSync(worldsPath, 'utf8')) as WorldsJson;
    return this.worlds;
  }

  getQuadrantMapIds(mapId: number, localX: number, localY: number): number[] {
    const worlds = this.load();
    if (!worlds) {
      return [mapId];
    }

    return getPrefetchMapIds(mapId, getQuadrant(localX, localY), worlds);
  }
}
