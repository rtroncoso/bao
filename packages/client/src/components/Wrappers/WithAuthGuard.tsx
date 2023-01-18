import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  AccountModel,
  selectAccount,
  selectToken
} from '@mob/client/queries/account';
import { State } from '@mob/client/store';
import { NextRouter, withRouter } from 'next/router';

interface ConnectedProps {
  account?: AccountModel;
  token?: string | null;
  router: NextRouter;
}

export interface WithAuthGuardOptions {
  redirectUrl?: string;
}

const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthGuardOptions
) => {
  const WithAuthGuardWrapper: React.FC<ConnectedProps> = (props) => {
    if (typeof window !== undefined && (!props.account || !props.token)) {
      props.router.replace((options && options.redirectUrl) || '/login', null, {
        shallow: true
      });

      return null;
    }

    return <Component {...(props as P)} />;
  };

  const mapStateToProps = (state: State) => ({
    account: selectAccount(state),
    token: selectToken(state)
  });

  return compose(withRouter, connect(mapStateToProps))(WithAuthGuardWrapper);
};

export const withAuthGuardOptions =
  <P extends object>(options: WithAuthGuardOptions) =>
  (Component: React.ComponentType<P>) =>
    withAuthGuard(Component, options);

export default withAuthGuard;
