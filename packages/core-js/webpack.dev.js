const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const devConfig = {
    mode: 'development',
    target: 'web',
    plugins: [new HotModuleReplacementPlugin()],
    devtool: 'eval-source-map'
};

module.exports = merge(common, devConfig);
