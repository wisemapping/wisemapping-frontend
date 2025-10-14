/** @type {import('webpack').Configuration} */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config;
switch (process.env.APP_CONFIG_TYPE) {
  case 'file:mock': {
    config = JSON.stringify(require('./config.mock.json'));
    break;
  }
  case 'file:prod': {
    config = JSON.stringify(require('./config.prod.json'));
    break;
  }
  case 'file:dev': {
    config = JSON.stringify(require('./config.dev.json'));
    break;
  }
  case 'remote': {
    config = process.env.APP_CONFIG_JSON;
    break;
  }
  default: {
    config = JSON.stringify(require('./config.mock.json'));
    break;
  }
}

const commonConfig = {
  entry: {
    app: path.join(__dirname, 'src', 'index.tsx'),
  },
  target: 'web',
  output: {
    filename: '[name].[contenthash:8].bundle.js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean dist folder before each build
  },
  module: {
    rules: [
      {
        test: /\.wxml$/i,
        type: 'asset/source',
      },
    ],
  },
  optimization: {
    chunkIds: 'named',
    runtimeChunk: {
      name: 'runtime',
    },
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 0,
      cacheGroups: {
        // React core libraries
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react-vendor',
          priority: 40,
          reuseExistingChunk: true,
        },
        // Material-UI and Emotion
        muiVendor: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'mui-vendor',
          priority: 35,
          reuseExistingChunk: true,
        },
        // Styling and i18n libraries
        stylesVendor: {
          test: /[\\/]node_modules[\\/](styled-components|react-intl)[\\/]/,
          name: 'styles-vendor',
          priority: 30,
          reuseExistingChunk: true,
        },
        // WiseMapping internal packages
        wisemappingLibs: {
          test: /[\\/]node_modules[\\/]@wisemapping[\\/]/,
          name: 'wisemapping-libs',
          priority: 25,
          reuseExistingChunk: true,
        },
        // All other node_modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Common code shared between chunks
        common: {
          minChunks: 2,
          name: 'common',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  externals: {},
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/*',
          to: '[name][ext]',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
  ],
};

module.exports = merge(common, commonConfig);
