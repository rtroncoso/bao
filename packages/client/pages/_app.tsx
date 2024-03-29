import { AppProps as NextAppProps } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import '@bao/client/assets/tailwind.css';
import '@bao/client/assets/canvas.css';
import { AppContainer } from '@bao/client/components/App';
import { store, persistor } from '@bao/client/store';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export type AppProps = NextAppProps & {
  err?: Error;
};

const AppEntrypoint = (props: AppProps) => {
  const { Component, pageProps, err } = props;

  return typeof window !== 'undefined' ? (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContainer {...props} {...pageProps}>
          <Component {...pageProps} err={err} />
        </AppContainer>
      </PersistGate>
    </Provider>
  ) : (
    <Provider store={store}>
      <AppContainer {...props} {...pageProps}>
        <Component {...pageProps} err={err} />
      </AppContainer>
    </Provider>
  );
};

export default AppEntrypoint;
