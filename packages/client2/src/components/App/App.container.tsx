import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { requestAsync } from 'redux-query';

import login, { LoginRequestParameters } from '@mob/client/queries/login';
import { getQueries, State } from '@mob/client/store';
import App from './App.component';

const mapStateToProps = (state: State) => ({
  queries: getQueries(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: (body: LoginRequestParameters) => dispatch(requestAsync(login(body)))
  }
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(App);
