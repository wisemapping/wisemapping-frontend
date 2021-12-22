const { merge } = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const common = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      minSize: 2000000,
    },
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i
    }),
  ],
};

module.exports = merge(common, prodConfig);
