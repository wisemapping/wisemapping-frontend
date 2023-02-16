const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.ts',
    library: {
      type: 'umd',
    },
  }
};

module.exports = merge(common, prodConfig);
