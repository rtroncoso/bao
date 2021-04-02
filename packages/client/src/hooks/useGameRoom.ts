
// import { Client, Room } from 'colyseus.js';
// import React, {
//   createContext,
//   useCallback,
//   useEffect
// } from 'react';
// import { useLocation } from 'react-router';

// import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

// export interface GameContextState {
//   client?: Client;
//   connected: boolean;
//   gameState?: WorldRoomState;
//   room?: Room<WorldRoomState>;
// }

// export interface GameContextProps {
//   callbacks: any;
//   state: GameContextState;
// }

// export interface GameRoomOptions {
//   room: string;
//   characterId?: string;
//   token?: string;
// }

// export const useGameRoom = <P>(props: P, options: GameRoomOptions) => {
//     const { token } = props;
//     const location = useLocation<GameComponentRouterState>();
//     const [state, setState, resetState] = useLocalStateReducer<GameContextState>(createInitialState());

//     const handleJoinRoom = useCallback(async () => {
//       try {
//         const client = new Client(process.env.MOB_SERVER);
//         const room = await client.joinOrCreate<WorldRoomState>(options.room, {
//           characterId: location.state.characterId,
//           token,
//         });

//         room.onStateChange((gameState: WorldRoomState) => {
//           setState({ gameState: gameState.toJSON() as WorldRoomState });
//         });

//         room.onError((error: any) => { throw error });

//         // room.onJoin(() => { setState({ connected: true }) });
//         room.onLeave(() => resetState());

//         setState({
//           connected: true,
//           client,
//           room
//         });
//       } catch(err) {
//         console.error(`[handleJoinRoom]: Error ${JSON.stringify(err, null, 2)}`);
//       }
//     }, [location, resetState, setState, token]);

//     const handleSendRoomMessage = useCallback((messageType, parameters) => {
//       if (state.client && state.room) {
//         return state.room.send(messageType, parameters)
//       }

//       console.warn(`[handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(parameters, null, 2)}`);
//     }, [state]);

//     const handleLeaveRoom = useCallback(() => {
//       if (state.client && state.room) {
//         state.room.leave(true);
//         return resetState();
//       }

//       console.warn(`[handleLeaveRoom]: trying to leave a closed room`);
//     }, [resetState, state]);

//     useEffect(() => {
//       handleJoinRoom();
//       return () => resetState();
//     }, []); // eslint-disable-line

//     const callbacks = {
//       handleJoinRoom,
//       handleLeaveRoom,
//       handleSendRoomMessage
//     };
// };

export default {}
