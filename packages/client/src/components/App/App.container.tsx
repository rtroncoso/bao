import { compose } from 'redux';
import { connect } from 'react-redux';

import { State } from '@bao/client/store';
import App from './App.component';

const mapStateToProps = (state: State) => {
  return {};
};
export default compose(connect(mapStateToProps))(App);
