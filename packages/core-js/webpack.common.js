const path = require('path');
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'core.js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  target: 'web',
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /.js$/,
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  }
};
