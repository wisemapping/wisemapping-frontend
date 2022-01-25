const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  entry: {
    "editor.bundle": path.join(__dirname, 'src', 'index.tsx')
  },
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
      rules: [
          {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: '/node_modules/'
          },
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            type: 'asset/inline',
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },
      ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
}
