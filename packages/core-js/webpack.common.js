const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
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
                ]
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [new CleanWebpackPlugin()],
};
