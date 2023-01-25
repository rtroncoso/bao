import { Reducer, useReducer } from 'react';
import { produce } from 'immer';

export const UPDATE = 'update';
export const RESET = 'reset';

export enum Action {
  UPDATE = 'update',
  RESET = 'reset'
}

export interface LocalReducerState {
  [key: string]: any;
}

export interface UpdateStateAction {
  payload: any;
  type: Action.UPDATE;
}

export interface ResetStateAction {
  payload: any;
  type: Action.RESET;
}

export type ActionTypes = Action.UPDATE | Action.RESET;

export type DefaultActions = UpdateStateAction | ResetStateAction;

export const updateStateAction = (payload: any): UpdateStateAction => ({
  payload,
  type: Action.UPDATE
});
export const clearStateAction = (payload: any): ResetStateAction => ({
  payload,
  type: Action.RESET
});

export const defaultReducer = <S extends LocalReducerState>(
  state: S,
  action: DefaultActions
): S => {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        ...action.payload
      };
    case RESET:
      return {
        ...action.payload
      };
    default:
      return state;
  }
};

export type SetStateCallback<S extends LocalReducerState> = (
  payload: Partial<S>
) => void;

export type UpdateStateCallback<S extends LocalReducerState> = (
  updater: (draft: S) => void
) => void;
export type ResetStateCallback = () => void;

export const useLocalStateReducer = <S extends LocalReducerState>(
  initialState: S,
  reducer = defaultReducer
): [S, SetStateCallback<S>, ResetStateCallback, UpdateStateCallback<S>] => {
  const [state, dispatch] = useReducer<Reducer<S, DefaultActions>>(
    reducer,
    initialState
  );

  const setState: SetStateCallback<S> = (payload) =>
    dispatch(updateStateAction(payload));
  const updateState: UpdateStateCallback<S> = (updater) =>
    dispatch(updateStateAction(produce(state, updater)));
  const resetState: ResetStateCallback = () =>
    dispatch(clearStateAction(initialState));

  return [state, setState, resetState, updateState];
};
