const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const prodConfig = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true,
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'react-intl': 'react-intl',
    '@emotion/styled': '@emotion/styled',
    '@emotion/react': '@emotion/react',
    '@mui/material': '@mui/material',
    '@mui/icons-material': '@mui/icons-material',
    '@mui/system': '@mui/system',
    '@mui/lab': '@mui/lab',
    'styled-components': 'styled-components',
    'xml-formatter': 'xml-formatter',
    'lodash-es': 'lodash-es',
  },
};

module.exports = merge(common, prodConfig);
