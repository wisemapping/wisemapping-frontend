const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: './lib/web2d.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '',
    },
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
    target: 'web',
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [new CleanWebpackPlugin()],
};
