const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/core.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'core.js',
        publicPath: '',
        library: {
            type: 'umd',
        },
    },
    target: 'web',
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /.js$/,
                exclude: [
                    /node_modules/,
                    path.resolve(__dirname, '../../libraries/mootools-core-1.4.5'),
                    path.resolve(__dirname, '../../libraries/underscore-min'),
                ]
            },
        ],
    },
    resolve: {
        alias: {
            '@libraries': path.resolve(__dirname, '../../libraries/'),
        },
        extensions: ['.js'],
    },
    plugins: [new CleanWebpackPlugin()],
};
