const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    layout: path.resolve(__dirname, './test/playground/layout/context-loader'),
    viewmode: path.resolve(__dirname, './test/playground/map-render/js/viewmode'),
    embedded: path.resolve(__dirname, './test/playground/map-render/js/embedded'),
    editor: path.resolve(__dirname, './test/playground/map-render/js/editor'),
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'test'),
    filename: '[name].test.js',
    publicPath: '',
  },
  devServer: {
    historyApiFallback: true,
    port: 8081,
    open: false,
  },
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 2000000,
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /.js$/,
        exclude: [
          /node_modules/,
          /lib\/raphael/ig,
        ],
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader?url=false',
          'less-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
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
        { from: 'test/playground/map-render/images/favicon.ico', to: 'favicon.ico' },
        { from: 'test/playground/map-render/images', to: 'images' },
        { from: 'test/playground/map-render/js', to: 'js' },
        { from: 'test/playground/map-render/samples', to: 'samples' },
        { from: 'test/playground/map-render/bootstrap', to: 'bootstrap' },
        { from: 'test/playground/index.html', to: 'index.html' },
        { from: 'test/playground/map-render/html/container.json', to: 'html/container.json' },
        { from: 'test/playground/map-render/html/container.html', to: 'container.html' },
        { from: 'test/playground/map-render/css/widget', to: 'css/widget' },
      ],
    }),
    new HtmlWebpackPlugin({
      chunks: ['layout'],
      filename: 'layout.html',
      template: 'test/playground/layout/index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['viewmode'],
      filename: 'viewmode.html',
      template: 'test/playground/map-render/html/viewmode.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['embedded'],
      filename: 'embedded.html',
      template: 'test/playground/map-render/html/embedded.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['editor'],
      filename: 'editor.html',
      template: 'test/playground/map-render/html/editor.html',
    }),
  ],
};
