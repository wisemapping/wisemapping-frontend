const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true
  },
  plugins: [
    new CompressionPlugin()
  ]
});
