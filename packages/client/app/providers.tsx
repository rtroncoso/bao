'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AppContainer } from '@bao/client/components/App';
import { AudioProvider } from '@bao/client/components/Audio';
import { persistor, store } from '@bao/client/store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AudioProvider>
        <PersistGate loading={null} persistor={persistor}>
          <AppContainer>{children}</AppContainer>
        </PersistGate>
      </AudioProvider>
    </Provider>
  );
}
