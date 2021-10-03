const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const namesHTML = [
    'arrow',
    'curvedLine',
    'events',
    'font',
    'group',
    'line',
    'polyLine',
    'prototype',
    'rect',
    'shapes',
    'text',
    'workspace',
];

const multiHtmlPlugin = namesHTML.map((name) => {
    return new HtmlWebpackPlugin({
        chunks: ['testing'],
        filename: `${name}`,
        template: `test/playground/${name}.html`,
    });
});

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        testing: './test/playground/testing.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'tests'),
        filename: 'testing.js',
        publicPath: '/',
    },
    devServer: {
        historyApiFallback: true,
        port: 8080,
        open: true,
    },
    mode: 'development',
    target: 'web',
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
        new HtmlWebpackPlugin({ template: 'test/playground/index.html' }),
    ].concat(multiHtmlPlugin),
};
