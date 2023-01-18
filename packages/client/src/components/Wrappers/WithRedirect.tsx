import { NextRouter, withRouter } from 'next/router';
import React from 'react';

export interface WithRedirectOptions<P> {
  predicate: (props: P) => boolean;
  redirectUrl: string;
}

export interface WithRedirectProps {
  router: NextRouter;
}

const withRedirect =
  <P extends object>(options: WithRedirectOptions<P>) =>
  (Component: React.ComponentType<P>) => {
    const WithRedirectWrapper: React.FC<P & WithRedirectProps> = (props) => {
      if (typeof window !== undefined && options.predicate(props)) {
        props.router.replace(options.redirectUrl, null, { shallow: true });
        return null;
      }

      return <Component {...props} />;
    };

    return withRouter(WithRedirectWrapper);
  };

export default withRedirect;
