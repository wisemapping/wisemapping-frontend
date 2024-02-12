/** @type {import('webpack').Configuration} */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const prodConfig = {
  entry: {
    app: path.join(__dirname, 'src', 'index.tsx'),
  },
  target: 'web',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.wxml$/i,
        type: 'asset/source',
      }
    ],
  },
  optimization: {
    chunkIds: 'named',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules\/.*/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/*',
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
  ],
};

module.exports = merge(common, prodConfig);
