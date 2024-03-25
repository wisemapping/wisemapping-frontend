const { merge } = require('webpack-merge');
const common = require('./webpack.common');
// const pkg = require('./package.json');

const prodConfig = {
  optimization: {
    usedExports: true,
    minimize: true,
  },
  // externals: [...Object.keys(pkg.dependencies)],
};

module.exports = merge(common, prodConfig);
