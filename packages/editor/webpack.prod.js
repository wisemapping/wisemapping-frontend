const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const prodConfig = {
  optimization: {
    usedExports: true,
    minimize: true,
  },
  externals: {
    react: 'react',
    reactDOM: 'react-dom',
    reactIntl: 'react-intl',
  },
};

module.exports = merge(common, prodConfig);
