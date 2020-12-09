const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackDynamicEnvPlugin = require('html-webpack-dynamic-env-plugin');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [

            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]

            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                    }
                }, ],
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/index.html'),
            templateParameters: {
                PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '/'
            },
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
        hot: true
    }
}