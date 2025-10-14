const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Load configuration for production - use same logic as common and dev
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
    config = JSON.stringify(require('./config.prod.json'));
    break;
  }
}

// Add support for versel URL.
let configUrl = '';
if (process.env.PUBLIC_URL) {
  configUrl = process.env.PUBLIC_URL;
} else if (process.env.VERCEL_BRANCH_URL) {
  configUrl = `https://${process.env.VERCEL_BRANCH_URL}/`;
}

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  stats: process.env.WEBPACK_STATS || 'normal',
  optimization: {
    minimize: true,
    // Bundle splitting is configured in webpack.common.js
    // Keep maxSize for automatic code splitting within chunks
    splitChunks: {
      maxSize: 244000, // ~244KB per chunk for optimal loading
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        GOOGLE_ADDS_ENABLED: process.env.GOOGLE_ADDS_ENABLED
          ? process.env.GOOGLE_ADDS_ENABLED
          : false,
        NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED ? process.env.NEW_RELIC_ENABLED : false,
      },
      base: configUrl,
    }),
    new (require('webpack').DefinePlugin)({
      'window.BoostrapConfig': config,
    }),
    ...(process.env.ANALYZE
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
            openAnalyzer: false,
            logLevel: 'info',
          }),
        ]
      : []),
  ],
});
