/* eslint-disable no-undef */
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// Get the config from the common file
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

module.exports = merge(common, {
  mode: 'development',
  // Use faster source maps for development (10x faster than 'source-map')
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    port: 3000,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false, // Don't show overlay for warnings in tests
      },
    },
    proxy: [
      {
        context: ['/api'],
        target: {
          host: '0.0.0.0',
          protocol: 'http:',
          port: 8080,
        },
      },
    ],
    historyApiFallback: {
      rewrites: [{ from: /^\/c\//, to: '/index.html' }],
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        GOOGLE_ADDS_ENABLED: false,
        NEW_RELIC_ENABLED: false,
      },
      base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'http://localhost:3000',
    }),
    new (require('webpack').DefinePlugin)({
      'window.BoostrapConfig': config,
    }),
    // Run TypeScript type checking in a separate process (non-blocking)
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: './tsconfig.json',
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  // Monitor build performance
  performance: {
    hints: false, // Disable for dev builds
  },
});
