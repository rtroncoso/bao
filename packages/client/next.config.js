const path = require('path');
const dotenv = require('dotenv');
const withTwin = require('./lib/withTwin.js');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiPort = process.env.API_PORT || '9000';
const serverPort = process.env.SERVER_PORT || '7666';

process.env.NEXT_PUBLIC_BAO_API ??=
  `http://localhost:${apiPort}/client`;
process.env.NEXT_PUBLIC_BAO_SERVER ??=
  `ws://localhost:${serverPort}`;
process.env.NEXT_PUBLIC_BAO_ASSETS ??=
  'http://localhost:8787';

if (process.env.VERCEL) {
  const requiredPublicEnv = [
    'NEXT_PUBLIC_BAO_API',
    'NEXT_PUBLIC_BAO_SERVER',
    'NEXT_PUBLIC_BAO_ASSETS'
  ];

  for (const key of requiredPublicEnv) {
    if (!process.env[key]) {
      throw new Error(
        `Missing ${key} for Vercel deployment. Set it in the Vercel project environment.`
      );
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bao/core',
    '@bao/server',
    '@bao/react-fps',
    '@bao/ui'
  ],
  // @inlet/react-pixi (React 17) breaks under Strict Mode double-mount: WebGL init
  // races and ticker teardown hits null (.off / checkMaxIfStatementsInShader).
  reactStrictMode: false,
  compiler: {
    styledComponents: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        module: false
      };
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

// PWA disabled during Next 15 migration; re-enable with @serwist/next in a later PR.
module.exports = withTwin(nextConfig);
