import { Reducer, useReducer } from 'react';

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

export const updateState = (payload: any): UpdateStateAction => ({
  payload,
  type: Action.UPDATE
});
export const clearState = (payload: any): ResetStateAction => ({
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

export type SetStateCallback<S> = (payload: Partial<S>) => void;
export type ResetStateCallback = () => void;

export const useLocalStateReducer = <S extends LocalReducerState>(
  initialState: S,
  reducer = defaultReducer
): [S, SetStateCallback<S>, ResetStateCallback] => {
  const [state, dispatch] = useReducer<Reducer<S, DefaultActions>>(
    reducer,
    initialState
  );
  const setState: SetStateCallback<S> = (payload) =>
    dispatch(updateState(payload));
  const resetState: ResetStateCallback = () =>
    dispatch(clearState(initialState));

  return [state, setState, resetState];
};
