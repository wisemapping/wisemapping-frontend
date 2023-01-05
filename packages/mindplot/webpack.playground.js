const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const playgroundConfig = {
  mode: 'development',
  entry: {
    layout: path.resolve(__dirname, './test/playground/layout/context-loader'),
  },
  output: {
    path: path.resolve(__dirname, 'test/playground/dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  devServer: {
    historyApiFallback: true,
    port: 8083,
    open: false
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'test/playground/index.html', to: 'index.html' },
      ],
    }),
    new HtmlWebpackPlugin({
      chunks: ['layout'],
      filename: 'layout.html',
      template: 'test/playground/layout/index.html',
    }),
  ],
};

module.exports = merge(common, playgroundConfig);
