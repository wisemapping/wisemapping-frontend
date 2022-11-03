const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const prodConfig = {
  optimization: {
    usedExports: true,
    minimize: true,
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'react-intl': 'react-intl',
    '@emotion/styled': '@emotion/styled',
    '@emotion/react': '@emotion/react',
  },
  plugins: [new CleanWebpackPlugin()],
};

module.exports = merge(common, prodConfig);
