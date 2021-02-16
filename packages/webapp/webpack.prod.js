const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true
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
    new CompressionPlugin()
  ]
});
