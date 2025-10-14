/** @type {import('webpack').Configuration} */
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
const path = require('path');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  stats: {
    errorDetails: true,
  },
  entry: {
    editor: './src/index.ts',
  },
};

module.exports = merge(common, prodConfig);
