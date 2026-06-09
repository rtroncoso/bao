export interface AccountFindParams {
  ids?: Array<number | string>
  user?: unknown
}

export interface AccountFindOneParams {
  id?: number | string
  username?: string
  showPassword?: boolean
  user?: unknown
}

export interface LoginParams {
  username: string
  password: string
  user?: unknown
}

export interface TokenParams {
  token: string
}

export interface CharacterFindParams {
  ids?: Array<number | string>
  accountId?: number | string
  user?: unknown
}

export interface CharacterFindOneParams {
  id?: number | string
  user?: unknown
}

export interface CharacterInventoryParams {
  characterId?: number | string
  user?: unknown
}

export interface ObjectFindParams {
  ids?: Array<number | string>
  user?: unknown
}

export interface ObjectFindOneParams {
  id?: number | string
  user?: unknown
}

export interface AccountFindQuery {
  ids: string[] | null
}

export interface AccountFindOneQuery {
  id: string
}

export interface LoginBody {
  username: string
  password: string
}

export interface TokenHeader {
  token: string | string[] | undefined
}

export interface CharacterFindQuery {
  ids: string[] | null
  accountId: string | null
}

export interface CharacterFindOneQuery {
  id: string
}

export interface CharacterInventoryQuery {
  characterId: string
}

export interface ObjectFindQuery {
  ids: string[] | null
}

export interface ObjectFindOneQuery {
  id: string
}

export type QueryValue = string | number | Array<string | number>
