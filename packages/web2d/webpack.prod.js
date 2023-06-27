const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const pkg = require('./package.json');

/** @type {import('webpack').Configuration} */
const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  externals: [...Object.keys(pkg.peerDependencies)],
};

module.exports = merge(common, prodConfig);
