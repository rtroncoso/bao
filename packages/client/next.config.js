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

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  }
};

module.exports = compose(
  withTwin,
  withTM(['@bao/core']),
  withPWA({
    disable: prod ? false : true,
    dest: 'public'
  })
)(config);
