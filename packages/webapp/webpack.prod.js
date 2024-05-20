const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Add support for versel URL.
let configUrl = '';
if (process.env.VERCEL_BRANCH_URL) {
  configUrl = `https://${process.env.VERCEL_BRANCH_URL}/`;
} else if (process.env.PUBLIC_URL) {
  configUrl = process.env.PUBLIC_URL;
}

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    splitChunks: {
      minSize: 240000,
      maxSize: 240000,
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        GOOGLE_ADDS_ENABLED: process.env.GOOGLE_ADDS_ENABLED ? process.env.GOOGLE_ADDS_ENABLED : false,
        NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED ? process.env.NEW_RELIC_ENABLED : false,

      },
      base: configUrl,
    }),
  ],
});
