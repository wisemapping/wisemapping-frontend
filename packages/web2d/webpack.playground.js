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

module.exports = {
    entry: {
        testing: './test/playground/context-loader.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'tests'),
        filename: 'context-loader.js',
        publicPath: '/',
    },
    devServer: {
        historyApiFallback: true,
        port: 8080,
        open: true,
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /.js$/,
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.js','.json'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({ template: 'test/playground/index.html' }),
    ].concat(multiHtmlPlugin),
};
