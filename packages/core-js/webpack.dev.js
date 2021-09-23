const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

/** @type {import('webpack').Configuration} */
const devConfig = {
    mode: 'development',
    target: 'web',
    plugins: [new HotModuleReplacementPlugin()],
    devtool: 'eval-source-map',
    devServer: {
        port: 8080,
        open: 'google-chrome-stable',
        hot: true,
    },
};

module.exports = merge(common, devConfig);
