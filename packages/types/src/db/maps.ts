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
}

export interface MapObjectSpawnRow {
  id: number
  mapId: number
  objectId: number
  amount: number
  x: number
  y: number
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

export interface MapSpawnsResponse {
  map: MapRow
  npcs: MapNpcSpawnRow[]
  objects: MapObjectSpawnRow[]
  tileExits: MapTileExitRow[]
}
