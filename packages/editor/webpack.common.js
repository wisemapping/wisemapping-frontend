const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  output: {
    filename: 'editor.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
    },
  },
  entry: {
      editor: path.join(__dirname, 'src', 'index.tsx')
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    hot: true,
  }
}
