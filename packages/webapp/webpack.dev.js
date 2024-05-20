/* eslint-disable no-undef */
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');


// Add support for versel URL.
let configUrl = 'http://localhost:3000';
if (process.env.VERCEL_BRANCH_URL) {
  configUrl = process.env.VERCEL_BRANCH_URL;
} else if (process.env.PUBLIC_URL) {
  configUrl = process.env.PUBLIC_URL;
}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3000,
    hot: true,
    proxy: [{
      context: ['/api'],
      target: {
        host: "0.0.0.0",
        protocol: 'http:',
        port: 8080
      },
    },
    ],
    historyApiFallback: {
      rewrites: [{ from: /^\/c\//, to: '/index.html' }],
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        GOOGLE_ADDS_ENABLED: false,
        NEW_RELIC_ENABLED: false,
      },
      base: configUrl,
    }),
  ]
});
