import { connect } from 'react-redux';
import { compose } from 'redux';

import { withAuthGuard } from '@bao/client/components/Wrappers';
import {
  AccountModel,
  CharacterModel,
  selectAccount,
  selectCharacters
} from '@bao/client/queries/account';
import { State } from '@bao/client/store';
import CharacterSelectionComponent from './CharacterSelection.component';

const mapStateToProps = (state: State) => {
  return {
    account: selectAccount(state),
    characters: selectCharacters(state)
  };
};

export type CharacterSelectionConnectedProps = ReturnType<
  typeof mapStateToProps
>;

export default compose(
  connect(mapStateToProps),
  withAuthGuard
)(CharacterSelectionComponent);
