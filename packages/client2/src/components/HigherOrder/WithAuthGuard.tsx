import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Redirect } from 'react-router-dom';

import { AccountModel, selectAccount, selectToken } from '@mob/client/queries/account';
import { State } from '@mob/client/store';

interface ConnectedProps {
  account?: AccountModel;
  token?: string;
}

export interface WithAuthGuardOptions {
  redirectUrl?: string;
}

const withAuthGuard = <P extends {}>(
  Component: React.ComponentType<P>,
  options: WithAuthGuardOptions
) => {
  const WithAuthGuardWrapper: React.FC<ConnectedProps> = (props) => {
    if (!props.account || !props.token) {
      return (
        <Redirect to={(options && options.redirectUrl) || '/login'} />
      )
    }

    return (
      <Component {...(props as P)} />
    );
  };

  const mapStateToProps = (state: State) => ({
    account: selectAccount(state),
    token: selectToken(state)
  });

  return compose(
    connect(mapStateToProps)
  )(WithAuthGuardWrapper);
};

export const withAuthGuardOptions = <P extends {}>(
  options: WithAuthGuardOptions
) => (
  Component: React.ComponentType<P>
) => withAuthGuard(Component, options);

export default withAuthGuard;
