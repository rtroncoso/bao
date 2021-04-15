import { compose } from 'redux';

import { withAuthGuard } from '@mob/client/components/HigherOrder';
import { ConnectedProps, withGameContext } from './Game.context';
import Game from './Game.component';

export const WorldRoomContainer = compose<React.FC<ConnectedProps>>(
  withAuthGuard,
  withGameContext
)(Game);

export default WorldRoomContainer;
