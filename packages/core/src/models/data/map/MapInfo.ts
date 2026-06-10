export interface MapInfo {
  id: number;
  name: string;
  musicNum: number;
  magiaSinEfecto: boolean;
  noEncriptarMP: boolean;
  terreno: string;
  zona: string;
  restringir: string;
  backup: boolean;
  pk: boolean;
}

export const createMapInfo = (partial: Partial<MapInfo> & { id: number }): MapInfo => ({
  id: partial.id,
  name: partial.name ?? '',
  musicNum: partial.musicNum ?? 0,
  magiaSinEfecto: partial.magiaSinEfecto ?? false,
  noEncriptarMP: partial.noEncriptarMP ?? false,
  terreno: partial.terreno ?? '',
  zona: partial.zona ?? '',
  restringir: partial.restringir ?? 'No',
  backup: partial.backup ?? false,
  pk: partial.pk ?? false,
});
