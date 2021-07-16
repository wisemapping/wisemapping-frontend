const path = require('path'); // eslint-disable-line
//const { ProvidePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // eslint-disable-line

/** @type {import('webpack').Configuration} */
module.exports = { // eslint-disable-line 
    entry: './lib/core.js',
    output: {
        path: path.resolve(__dirname, 'dist'), // eslint-disable-line
        filename: 'core.js',
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
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [new CleanWebpackPlugin()],
};

/*
 *{
        core: [
            path.resolve(__dirname, '../mindplot/src/main/javascript/Options'),
            path.resolve(
                __dirname,
                '../mindplot/src/main/javascript/libraries/bootstrap/BootstrapDialog'
            ),
            path.resolve(
                __dirname,
                '../mindplot/src/main/javascript/libraries/bootstrap/BootstrapDialog.Request'
            ),
        ],
    },
Options: path.resolve(path.join(__dirname, '../mindplot/src/main/javascript/Options')),
            BootstrapDialog: path.resolve(
                path.join(
                    __dirname,
                    '../mindplot/src/main/javascript/libraries/bootstrap/BootstrapDialog'
                )
            ),
            BootstrapDialogRequest: path.resolve(
                path.join(
                    __dirname,
                    '../mindplot/src/main/javascript/libraries/bootstrap/BootstrapDialog.Request'
                )
            ),
 * */
