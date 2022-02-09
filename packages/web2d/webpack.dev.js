const { merge } = require('webpack-merge');
const common = require('./webpack.common');

/** @type {import('webpack').Configuration} */
const prodConfig = {
  mode: 'development',
  devtool: 'source-map',
};

module.exports = merge(common, prodConfig);
