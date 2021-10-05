const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './lib/web2d.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '',
  },
  module: {
    rules: [
      {
        use: ['babel-loader', 'eslint-loader'],
        test: /.(js)$/,
        exclude: /node_modules/,
      }
    ],
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.json'],
  },
  plugins: [new CleanWebpackPlugin()],
  
};
