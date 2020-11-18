import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withAuthGuard } from '@mob/client/components/HigherOrder';
import { selectToken } from '@mob/client/queries/account';
import { State } from '@mob/client/store';
import Game from './Game.component';

export interface ConnectedProps {
  token: string | null;
}

const mapStateToProps = (state: State) => ({
  token: selectToken(state)
});

export default compose(
  connect(mapStateToProps),
  withAuthGuard,
  withRouter
)(Game);
