const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const namesHTML = [
  'arrow',
  'curvedLine',
  'events',
  'font',
  'group',
  'line',
  'polyLine',
  'prototype',
  'rect',
  'shapes',
  'text',
  'workspace',
];

const multiHtmlPlugin = namesHTML.map(
  (name) => new HtmlWebpackPlugin({
    chunks: ['testing'],
    filename: `${name}.html`,
    template: `test/playground/${name}.html`,
  }),
);

module.exports = {
  entry: {
    testing: './test/playground/context-loader.js',
    jquery: '../../libraries/jquery-2.1.0',
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
          path.resolve(__dirname, '../../libraries/mootools-core-1.4.5'),
          path.resolve(__dirname, '../../libraries/underscore-min'),
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
      '@svg': path.resolve(__dirname, './src/components/peer/svg/'),
      '@utils': path.resolve(__dirname, './src/components/peer/utils/'),
      '@components': path.resolve(__dirname, './src/components/'),
    },
    extensions: ['.js', '.json'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: 'test/playground/index.html' }),
  ].concat(multiHtmlPlugin),
};
