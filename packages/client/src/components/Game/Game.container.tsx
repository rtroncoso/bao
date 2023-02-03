import { compose } from 'redux';

import { withChatContext } from '@bao/client/components';
import { withAuthGuard } from '@bao/client/components/Wrappers';
import { GameConnectedProps, withGameContext } from './Game.context';
import Game from './Game.component';

export const WorldRoomContainer = compose<React.FC<GameConnectedProps>>(
  withAuthGuard,
  withGameContext,
  withChatContext
)(Game);

export default WorldRoomContainer;
