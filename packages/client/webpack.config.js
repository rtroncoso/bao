const fs = require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);

const { webpack: lernaAliases } = require('lerna-alias')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = !IS_PRODUCTION;
const ROOT = __dirname;
const CLIENT_PATH = path.resolve(ROOT, 'src');
const MODULES_PATH = [path.resolve(ROOT, 'node_modules')];
const INCLUDE_PATHS = [CLIENT_PATH];
const ENTRY_POINT = path.join(ROOT, 'src/app');
const OUTPUT_PATH = path.join(ROOT, 'dist');
const PUBLIC_PATH = '/';

const sharedConfig = require('./src/config');
const MAP_PATH = sharedConfig.mapPath;
const INIT_PATH = sharedConfig.initPath;
const AUDIO_PATH = sharedConfig.audioPath;
const TEXTURE_PATH = `${sharedConfig.texturePath}`;
const TILESETS_PATH = `${sharedConfig.texturePath}/${sharedConfig.tilesetsType}`;
const ANIMATIONS_PATH = `${sharedConfig.texturePath}/${sharedConfig.animationsType}`;

const config = {
  context: CLIENT_PATH,
  entry: ['babel-polyfill', ENTRY_POINT],
  mode: IS_PRODUCTION ? 'production' : 'development',
  performance: IS_PRODUCTION ? {
    hints: false,
    maxEntrypointSize: 6144,
    maxAssetSize: 6144
  } : {},
  output: {
    path: OUTPUT_PATH,
    publicPath: PUBLIC_PATH,
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(false),
    new CleanWebpackPlugin(['dist'], {
      root: ROOT,
      verbose: false,
    }),
    new CopyWebpackPlugin([
      { from: 'assets/audio', to: AUDIO_PATH },
      // { from: 'assets/graphics', to: TEXTURE_PATH },
      { from: 'assets/graphics/tilesets', to: TILESETS_PATH },
      { from: 'assets/graphics/animations', to: ANIMATIONS_PATH },
      { from: 'assets/init', to: INIT_PATH },
      { from: 'assets/maps', to: MAP_PATH },
    ], { ignore: ['.*'] }),
    new HtmlWebpackPlugin({
      title: 'PIXI/Mob.js Starter Pack',
      minify: { collapseWhitespace: true },
      template: 'index.hbs',
      cache: true,
      hash: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      },
      {
        test: /.(sa|sc|c)ss$/,
        include: INCLUDE_PATHS,
        use: [
          IS_DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.jsx?$/,
        include: INCLUDE_PATHS,
        exclude: MODULES_PATH,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react']
            }
          }
        ],
      },
      {
        test: /\.jpe?g$|\.svg$|\.png$/,
        include: INCLUDE_PATHS,
        exclude: MODULES_PATH,
        use: {
          loader: 'file-loader'
        }
      },
      {
        test: /\.(shader|vert|frag|geom)$/i,
        include: INCLUDE_PATHS,
        exclude: MODULES_PATH,
        use: 'raw-loader'
      },
      {
        test: /\.(ini|dat)$/i,
        include: INCLUDE_PATHS,
        exclude: MODULES_PATH,
        use: 'ini-loader'
      },
      {
        test: /\.(map|inf|ind)$/i,
        include: INCLUDE_PATHS,
        exclude: MODULES_PATH,
        use: 'buffer-loader'
      }
    ],
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false,
  },
  devtool: IS_DEVELOPMENT ? 'inline-source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules'],
    alias: {
      core: path.resolve(__dirname, '../core/src'),
      client: path.resolve(__dirname, './src'),
      ecs: path.resolve(__dirname, './src/components/ECS'),
      store: path.resolve(__dirname, './src/store'),
      ...lernaAliases()
    },
  }
};

const splitChunks = {
  cacheGroups: {
    default: false,
    vendors: false,
    vendor: {
      chunks: 'all',
      test: /node_modules/
    }
  }
};

const minimizer = [new TerserPlugin({
  test: /\.js(\?.*)?$/i,
  include: INCLUDE_PATHS,
  parallel: true,
  cache: true,
  terserOptions: {
    output: { comments: false },
    warnings: false,
    mangle: true,
    nameCache: null,
    keep_names: false,
    compress: {}
  },
})];

if (IS_PRODUCTION) {
  const prodPlugins = [
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new OptimizeCSSAssetsPlugin({})
  ];
  config.optimization = {
    splitChunks,
    minimizer,
  };
  config.plugins = config.plugins.concat(prodPlugins);
} else if (IS_DEVELOPMENT) {
  const devPlugins = [
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          fix: true,
        },
      },
    }),
    new webpack.NamedModulesPlugin(),
  ];
  config.plugins = config.plugins.concat(devPlugins);
  config.module.rules.unshift({
    test: /\.jsx?$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [ROOT],
    exclude: MODULES_PATH,
  });
}

module.exports = config;
