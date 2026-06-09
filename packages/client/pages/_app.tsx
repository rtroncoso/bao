import { AppProps as NextAppProps } from 'next/app';
import React from 'react';

import '@bao/ui/globals.css';
import '@bao/client/assets/canvas.css';
import { fontSans } from '@bao/client/lib/fonts';
import { AppProviders } from '../app/providers';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

export type AppProps = NextAppProps & {
  err?: Error;
};

const AppEntrypoint = ({ Component, pageProps, err }: AppProps) => {
  return (
    <div className={`${fontSans.variable} min-h-screen font-sans antialiased`}>
      <AppProviders>
        <Component {...pageProps} err={err} />
      </AppProviders>
    </div>
  );
};

export default AppEntrypoint;
