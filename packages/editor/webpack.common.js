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
  devtool: 'eval-source-map',
  target: 'web',
  resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  externals: {
    react: 'react',
    reactDOM: 'react-dom',
    reactIntl: 'react-intl',
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
      ],
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html')
    }),
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
