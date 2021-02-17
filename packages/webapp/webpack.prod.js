const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true
  },
  plugins: [
    new CompressionPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'https://www.wisemapping.com'
      },
      base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'https://www.wisemapping.com'
    })
  ]
});
