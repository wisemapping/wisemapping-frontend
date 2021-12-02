const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/web2d.js',
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
        test: /.(js)$/,
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
      '@svg': path.resolve(__dirname, 'src/components/peer/svg/'),
      '@utils': path.resolve(__dirname, 'src/components/peer/utils/'),
      '@components': path.resolve(__dirname, 'src/components/'),
    },
    extensions: ['.js', '.json'],
  },
  plugins: [new CleanWebpackPlugin()],
};
