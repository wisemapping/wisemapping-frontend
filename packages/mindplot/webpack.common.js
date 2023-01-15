const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  entry: {
    mindplot: './src/index.ts',
    loader: './src/indexLoader.ts',
  },
  mode: 'production',
  resolve: {
    alias: {
      '@libraries': path.resolve(__dirname, '../../libraries/'),
    },
  },
};
module.exports = merge(common, prodConfig);
