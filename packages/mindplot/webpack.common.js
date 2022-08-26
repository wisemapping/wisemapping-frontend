const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  entry: {
    mindplot: './src/index.ts',
    loader: './src/indexLoader.ts',
  },
  stats: {
    errorDetails: true,
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /.(js$)/,
        use: ['babel-loader'],
        exclude: [/node_modules/],
        enforce: 'pre',
      },
      {
        test: /\.(ts)$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.(png|svg)$/i,
        type: 'asset/inline',
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
    },
    extensions: ['.js', '.ts', '.json'],
  },
  plugins: [new CleanWebpackPlugin()],
};
