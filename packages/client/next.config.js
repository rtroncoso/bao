const path = require('path');
const dotenv = require('dotenv');
const { compose } = require('@reduxjs/toolkit');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules');
const withTwin = require('./lib/withTwin.js');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prod = process.env.NODE_ENV === 'production';
const apiPort = process.env.API_PORT || '9000';
const serverPort = process.env.SERVER_PORT || '7666';

/** @type {import('next').NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_BAO_API:
      process.env.CLIENT_API_URL || `http://localhost:${apiPort}/client`,
    NEXT_PUBLIC_BAO_SERVER:
      process.env.CLIENT_SERVER_URL || `ws://localhost:${serverPort}`,
    NEXT_PUBLIC_BAO_ASSETS:
      process.env.CLIENT_ASSETS_URL || 'https://bao-assets.rtroncoso.com',
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.module = false;
    }

    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.(shader|vert|frag|geom)$/i,
        use: 'raw-loader'
      },
      {
        test: /\.(ini|dat)$/i,
        use: 'ini-loader'
      },
      {
        test: /\.(map|inf|ind)$/i,
        use: 'buffer-loader'
      }
    );

    return config;
  }
};

module.exports = compose(
  withTwin,
  withPWA({
    disable: prod ? false : true,
    dest: 'public'
  }),
  withTM([
    '@bao/core',
    '@bao/server',
    '@bao/react-fps'
  ]),
)(config);
