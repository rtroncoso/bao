import { ErrorsState, QueriesState } from "redux-query";

import { AccountEntities } from "@mob/client/queries/account";
import { AssetEntities } from "./assets";

export type EntitiesState =
  & AccountEntities
  & AssetEntities
;

export interface QueryState {
entities: EntitiesState,
errors: ErrorsState,
queries: QueriesState,
}
