const { merge } = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const common = require('./webpack.common');

const prodConfig = {
  optimization: {
    minimize: true,
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i
    }),
  ],
};

module.exports = merge(common, prodConfig);
