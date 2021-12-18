const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'web2d.js',
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
        ],
      },
    ],
  },
  target: 'web',
  plugins: [new CleanWebpackPlugin()],
};
