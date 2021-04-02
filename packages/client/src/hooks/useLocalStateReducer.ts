import { Reducer, useReducer } from 'react';

export const UPDATE = 'update';
export const RESET = 'reset';

export enum Action {
  UPDATE = 'update',
  RESET = 'reset',
}

export interface State {
  [key: string]: any;
}

export interface UpdateStateAction {
  payload: any,
  type: Action.UPDATE;
}

export interface ResetStateAction {
  payload: any;
  type: Action.RESET;
}

export type ActionTypes =
  | Action.UPDATE
  | Action.RESET;

export type DefaultActions =
  | UpdateStateAction
  | ResetStateAction;

export const updateState = (payload: any): UpdateStateAction => ({ payload, type: Action.UPDATE });
export const clearState = (payload: any): ResetStateAction => ({ payload, type: Action.RESET });

export const defaultReducer = <S extends State>(state: S, action: DefaultActions): S => {
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

export const useLocalStateReducer = <S extends State>(
  initialState: S,
  reducer = defaultReducer
): [S, (payload: Partial<S>) => void, () => void] => {
  const [state, dispatch] = useReducer<Reducer<S, DefaultActions>>(reducer, initialState);
  const setState = (payload: Partial<S>) => dispatch(updateState(payload));
  const resetState = () => dispatch(clearState(initialState));

  return [state, setState, resetState];
};
