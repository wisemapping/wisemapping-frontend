const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: './test/javascript/render/testing.js',
    output: {
        path: path.resolve(__dirname, 'dist', 'tests'),
        filename: '[name].js',
        publicPath: '',
    },
    mode: 'production',
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
    plugins: [new CleanWebpackPlugin()],
};
