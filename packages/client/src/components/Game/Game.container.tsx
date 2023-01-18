import { connect } from 'react-redux';
import { compose } from 'redux';

import { withAuthGuard } from '@mob/client/components/Wrappers';
import { selectToken } from '@mob/client/queries/account';
import { State } from '@mob/client/store';
import Game from './Game.component';

const mapStateToProps = (state: State) => ({
  token: selectToken(state)
});

export type GameConnectedProps = ReturnType<typeof mapStateToProps>;

export default compose(connect(mapStateToProps), withAuthGuard)(Game);
