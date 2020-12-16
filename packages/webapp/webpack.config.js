const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


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
        rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                    }
                }]
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [{
                from: 'public/*',
                to: '[name].[ext]',
                globOptions: {
                    ignore: [
                        '**/index.html'
                    ]
                }
            }]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/index.html'),
            templateParameters: {
                PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'http://localhost:3000'
            },
            base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'http://localhost:3000'
        })

    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
        hot: true,
        historyApiFallback: {
            rewrites: [
                { from: /^\/c\//, to: '/index.html' }
            ]
        }
    }
}