/** @type {import('webpack').Configuration} */
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
const path = require('path');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  stats: {
    errorDetails: true,
  }, entry: {
    'editor.bundle': path.join(__dirname, 'src', 'index.tsx'),
  },
  mode: 'development',
  target: 'web',
};

module.exports = merge(common, prodConfig);
