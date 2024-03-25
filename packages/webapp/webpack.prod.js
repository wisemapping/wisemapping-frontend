const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
      base: process.env.PUBLIC_URL,
    }),
  ],
});
