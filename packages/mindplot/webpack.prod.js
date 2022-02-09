const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const prodConfig = {
  optimization: {
    usedExports: true,
    minimize: true,
  },
};

module.exports = merge(common, prodConfig);
