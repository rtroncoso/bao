import type { Metadata } from 'next';
import React from 'react';

import '@bao/ui/globals.css';
import '@bao/client/assets/canvas.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { fontSans } from '@bao/client/lib/fonts';

import { AppProviders } from './providers';

config.autoAddCss = false;

export const metadata: Metadata = {
  title: {
    default: 'BAO',
    template: '%s · BAO'
  },
  description: 'Cliente web del juego BAO'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={fontSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
