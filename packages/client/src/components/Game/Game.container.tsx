import { compose } from 'redux';

import { withAuthGuard } from '@mob/client/components/HigherOrder';
import { withGameContext } from './Game.context';
import Game from './Game.component';

export const WorldRoomContainer = compose(
  withAuthGuard,
  withGameContext
)(Game);

export default WorldRoomContainer;
