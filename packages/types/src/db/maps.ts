export interface MapRow {
  id: number
  name: string
  zone: string
  terrain: string
  musicId: number
  pk: number
  backup: number
  magiaSinEfecto: number
  noEncriptarMP: number
  restringir: string
}

export interface MapNpcSpawnRow {
  id: number
  mapId: number
  npcId: number
  x: number
  y: number
  bodyId: number
  headId: number
  heading: number
  description: string | null
  hostile: number
}

export interface MapObjectSpawnRow {
  id: number
  mapId: number
  objectId: number
  amount: number
  x: number
  y: number
  graphicId: number
  objectType: number
  /** Resolved from objects_attributes when objectType is door (6). */
  openObjectId?: number
  closedObjectId?: number
  openGraphicId?: number
  closedGraphicId?: number
}

export interface MapTileExitRow {
  id: number
  mapId: number
  x: number
  y: number
  targetMapId: number
  targetX: number
  targetY: number
}

export interface MapBlockedTileRow {
  id: number
  mapId: number
  x: number
  y: number
}

export interface MapSpawnsResponse {
  map: MapRow
  npcs: MapNpcSpawnRow[]
  objects: MapObjectSpawnRow[]
  tileExits: MapTileExitRow[]
  blockedTiles: MapBlockedTileRow[]
}
