const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseUrl = 'https://www.wisemapping.com';

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : baseUrl,
      },
      base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : baseUrl,
    }),
  ],
});
