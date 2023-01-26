const { compose } = require('@reduxjs/toolkit');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules');
const withTwin = require('./lib/withTwin.js')

const prod = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const config = {
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
  withTM(['@bao/core', '@bao/server']),
  withPWA({
    disable: prod ? false : true,
    dest: 'public'
  })
)(config);
