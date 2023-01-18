const { compose } = require('@reduxjs/toolkit');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules');

const prod = process.env.NODE_ENV === 'production';

const config = {
  compiler: {
    styledComponents: true
  },
  images: {
    domains: []
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.module = false;
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  }
};

module.exports = compose(
  withTM(['@mob/core']),
  withPWA({
    disable: prod ? false : true,
    dest: 'public'
  })
)(config);
