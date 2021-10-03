const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 

module.exports = {
    entry: './lib/core.js',
    output: {
        path: path.resolve(__dirname, 'dist'), 
        filename: 'core.js',
        publicPath: '',
    },
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
        extensions: ['.js'],
    },
    plugins: [new CleanWebpackPlugin()],
};
