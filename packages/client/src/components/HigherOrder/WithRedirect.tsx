import React from 'react';
import { Redirect } from 'react-router-dom';

export interface WithRedirectOptions<P> {
  predicate: (props: P) => boolean;
  redirectUrl: string;
}

const withRedirect = <P extends {}>(
  options: WithRedirectOptions<P>
) => (
  Component: React.ComponentType<P>,
) => {
  const WithRedirectWrapper: React.FC<P> = (props) => {
    if (options.predicate(props)) {
      return (
        <Redirect to={options.redirectUrl} />
      )
    }

    return (
      <Component {...props} />
    );
  };

  return WithRedirectWrapper;
};

export default withRedirect;
