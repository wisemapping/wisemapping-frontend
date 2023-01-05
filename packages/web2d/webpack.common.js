const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'web2d.js',
    publicPath: '',
    library: {
      type: 'umd',
    },
  },
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        use: ['babel-loader'],
        test: /.(js)$/,
        exclude: [/node_modules/],
      },
    ],
  },
};
