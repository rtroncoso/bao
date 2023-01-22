import { compose } from 'redux';

import { withAuthGuard } from '@bao/client/components/Wrappers';
import { GameConnectedProps, withGameContext } from './Game.context';
import Game from './Game.component';

export const WorldRoomContainer = compose<React.FC<GameConnectedProps>>(
  withAuthGuard,
  withGameContext
)(Game);

export default WorldRoomContainer;
