import { QueryState } from "./models";

export const getEntities = (state: QueryState) => state.entities;
export const getErrors = (state: QueryState) => state.errors;
export const getQueries = (state: QueryState) => state.queries;
