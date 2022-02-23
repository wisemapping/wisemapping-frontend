const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

const playgroundConfig = {
  mode: 'development',
  entry: {
    viewmode: path.resolve(__dirname, './test/playground/map-render/js/viewmode'),
    editor: path.resolve(__dirname, './test/playground/map-render/js/editor'),
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
    port: 8081,
    open: false,
  },
  plugins: [
    new CleanWebpackPlugin({
      dangerouslyAllowCleanPatternsOutsideProject: true,
      dry: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'test/playground/map-render/images/favicon.ico', to: 'favicon.ico' },
        { from: 'test/playground/map-render/images', to: 'images' },
        { from: 'test/playground/map-render/js', to: 'js' },
        { from: 'test/playground/map-render/samples', to: 'samples' },
        { from: 'test/playground/index.html', to: 'index.html' },
      ],
    }),
    new HtmlWebpackPlugin({
      chunks: ['viewmode'],
      filename: 'viewmode.html',
      template: 'test/playground/map-render/html/viewmode.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['editor'],
      filename: 'editor.html',
      template: 'test/playground/map-render/html/editor.html',
    }),
  ],
};

module.exports = merge(common, playgroundConfig);
