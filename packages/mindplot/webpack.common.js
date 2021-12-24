const path = require('path');
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
  optimization: {
    usedExports: true,
  },
  entry: {
    mindplot: './src/index.js',
    loader: './src/indexLoader.js',
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        use: ['babel-loader'],
        test: /.(js$)/,
        exclude: [
          /node_modules/,
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
  plugins: [new CleanWebpackPlugin()],
};
