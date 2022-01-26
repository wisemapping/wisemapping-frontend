const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
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
    open: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader?url=false'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: '../../libraries/bootstrap', to: 'bootstrap' },
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
