const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: {
    layout: path.resolve(__dirname, './test/playground/layout/context-loader'),
    'map-render': path.resolve(__dirname, './test/playground/map-render/js/editor'),
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'test'),
    filename: '[name].test.js',
    publicPath: '',
  },
  devServer: {
    historyApiFallback: true,
    port: 8081,
    open: false,
  },
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 2000000,
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /.js$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, '../../libraries/mootools-core-1.4.5'),
          path.resolve(__dirname, '../../libraries/underscore-min'),
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
      '@commands': path.resolve(__dirname, './src/components/commands/'),
      '@layout': path.resolve(__dirname, './src/components/layout/'),
      '@libs': path.resolve(__dirname, './src/components/libraries/'),
      '@model': path.resolve(__dirname, './src/components/model'),
      '@persistence': path.resolve(__dirname, './src/components/persistence/'),
      '@util': path.resolve(__dirname, './src/components/util/'),
      '@widget': path.resolve(__dirname, './src/components/widget/'),
      '@components': path.resolve(__dirname, './src/components/'),
    },
    extensions: ['.js', '.json'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'test/playground/map-render/images/favicon.ico', to: 'favicon.ico' },
        { from: 'test/playground/map-render/images', to: 'images' },
        { from: 'test/playground/map-render/icons', to: 'icons' },
        { from: 'test/playground/map-render/css', to: 'css' },
        { from: 'test/playground/map-render/samples', to: 'samples' },
        { from: 'test/playground/index.html', to: 'index.html' },
      ],
    }),
    new HtmlWebpackPlugin({
      chunks: ['layout'],
      filename: 'layout.html',
      template: 'test/playground/layout/index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['map-render'],
      filename: 'viewmode.html',
      template: 'test/playground/map-render/html/viewmode.html',
    }),
  ],
};
