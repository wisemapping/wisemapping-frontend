const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    arrow: './test/playground/arrow.js',
    curvedLine: './test/playground/curvedLine.js',
    events: './test/playground/events.js',
    font: './test/playground/font.js',
    rect: './test/playground/rect.js',
    line: './test/playground/line.js',
    workspace: './test/playground/workspace.js',
    polyLine: './test/playground/polyLine.js',
    shapes: './test/playground/shapes.js',
    group: './test/playground/group.js',
    prototype: './test/playground/prototype.js',
    text: './test/playground/text.js',
    image: './test/playground/image.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'tests'),
    filename: '[name].js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    port: 8080,
    open: false,
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /.js$/,
        exclude: [
          /node_modules/,
        ],
      },
      {
        test: /\.(png|svg)$/i,
        type: 'asset/inline',
      },
    ],
  },
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
    },
    extensions: ['.js', '.json'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'test/playground/styles.css', to: 'styles.css' },
      ],
    }),
    new HtmlWebpackPlugin(
      {
        chunks: ['index'],
        filename: 'index.html',
        template: 'test/playground/index.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['arrow'],
        filename: 'arrow.html',
        template: 'test/playground/arrow.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['curvedLine'],
        filename: 'curvedLine.html',
        template: 'test/playground/curvedLine.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['events'],
        filename: 'events.html',
        template: 'test/playground/events.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['font'],
        filename: 'font.html',
        template: 'test/playground/font.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['rect'],
        filename: 'rect.html',
        template: 'test/playground/rect.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['line'],
        filename: 'line.html',
        template: 'test/playground/line.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['workspace'],
        filename: 'workspace.html',
        template: 'test/playground/workspace.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['polyLine'],
        filename: 'polyLine.html',
        template: 'test/playground/polyLine.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['shapes'],
        filename: 'shapes.html',
        template: 'test/playground/shapes.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['group'],
        filename: 'group.html',
        template: 'test/playground/group.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['prototype'],
        filename: 'prototype.html',
        template: 'test/playground/prototype.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['text'],
        filename: 'text.html',
        template: 'test/playground/text.html',
      },
    ),
    new HtmlWebpackPlugin(
      {
        chunks: ['image'],
        filename: 'image.html',
        template: 'test/playground/image.html',
      },
    ),
  ],
};
