const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const devConfig = {
  mode: 'development',
  plugins: [new HotModuleReplacementPlugin()],
  devtool: 'eval-source-map',
};

module.exports = merge(common, devConfig);
