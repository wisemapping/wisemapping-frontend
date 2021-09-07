const path = require('path');
const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

/** @type {import('webpack').Configuration} */
const devConfig = {
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'lib'),
        compress: true,
        port: 8080,
        hot: true,
    },
    target: 'web',
    plugins: [new HotModuleReplacementPlugin()],
    devtool: 'eval-source-map',
};

module.exports = merge(common, devConfig);
