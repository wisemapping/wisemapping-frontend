const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        palette: path.resolve(__dirname, './test/playground/lib/testPalette'),
        layout: path.resolve(__dirname, './test/playground/lib/testLayout'),
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'test'),
        filename: '[name].test.js',
        publicPath: '',
    },
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 2000000,
        },
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
            },
            {
                type: 'asset',
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'test/playground/index.html',
        }),
        new HtmlWebpackPlugin({
            chunks: ['layout'],
            filename: 'layout',
            template: 'test/playground/layout.html',
        }),
    ],
};
