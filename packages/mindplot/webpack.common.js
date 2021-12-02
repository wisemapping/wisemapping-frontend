const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/mindplot',
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
          path.resolve(__dirname, '../../libraries/mootools-core-1.4.5'),
          path.resolve(__dirname, '../../libraries/underscore-min'),
        ],
      },
    ],
  },
  target: 'web',
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
  plugins: [new CleanWebpackPlugin()],
};
