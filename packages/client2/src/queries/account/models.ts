export interface ClassModel {
  id: number;
  name: string;
}

export interface RaceModel {
  id: number;
  name: string;
}

export interface CharacterModel {
  account_id: number;
  body: number;
  class: Array<ClassModel>;
  genre: number;
  head: number;
  helmet: number;
  id: number;
  name: string;
  race: Array<RaceModel>;
  shield: number;
  weapon: number;
  world: number;
  x: number;
  y: number;
}

export interface AccountModel {
  characters?: Array<CharacterModel>;
  email: string;
  id: number;
  username: string;
}

export interface LoginRequestParameters {
  username: string;
  password: string;
}

export interface LoginSuccessResponse {
  account: AccountModel;
  token: string;
}

export interface CharacterEntity {
  [key: number]: CharacterModel;
}

export interface LoginEntities {
  account?: AccountModel;
  characters?: CharacterEntity;
  token?: string;
}
