const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const baseUrl = 'https://www.wisemapping.com';
module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    splitChunks: {
      minSize: 245000,
      maxSize: 245000,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : baseUrl,
      },
      base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : baseUrl,
    }),
    new webpack.DefinePlugin({
      API_BASE_URL: process.env.API_BASE_URL ? process.env.API_BASE_URL : baseUrl,
    }),
  ],
});
