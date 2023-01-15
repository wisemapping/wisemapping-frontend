const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

const prodConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'core.js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  target: 'web',
 
  
};

module.exports = merge(common, prodConfig);
