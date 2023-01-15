/** @type {import('webpack').Configuration} */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'web2d.js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  }
};

module.exports = merge(common, prodConfig);
