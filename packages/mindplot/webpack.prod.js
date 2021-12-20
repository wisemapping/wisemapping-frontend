const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 2000000,
    },
  },
};

module.exports = merge(common, prodConfig);
