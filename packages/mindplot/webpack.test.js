const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        testingLayout: './test/javascript/static/test/testingLayout',
        testingPallete: './test/javascript/static/test/testingPalette',
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'tests'),
        filename: '[name].js',
        publicPath: '',
    },
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
    plugins: [new CleanWebpackPlugin()],
};
