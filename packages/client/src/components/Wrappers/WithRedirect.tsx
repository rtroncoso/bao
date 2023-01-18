import { NextRouter, withRouter } from 'next/router';
import React, { useEffect } from 'react';

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
      useEffect(() => {
        if (options.predicate(props)) {
          props.router?.replace(options.redirectUrl, null, { shallow: true });
        }
      }, [props]);

      return <Component {...props} />;
    };

    return withRouter(WithRedirectWrapper);
  };

export default withRedirect;
