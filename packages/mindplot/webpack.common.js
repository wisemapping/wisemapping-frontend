const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        use: ['babel-loader', 'eslint-loader'],
        test: /.(js$)/,
        exclude: [
          /node_modules/,
        ],
      },
    ],
  },
  target: 'web',
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
    },
    extensions: ['.js', '.json'],
  },
  plugins: [new CleanWebpackPlugin()],
};
