const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const prodConfig = {
  optimization: {
    usedExports: true,
    minimize: true,
  },
  externals: [{
    'react': 'react',
    'react-dom': 'react-dom',
    'react-intl': 'react-intl',
    '@emotion/styled': '@emotion/styled',
    '@emotion/react': '@emotion/react',
    "@mui/system": "@mui/system",
    "@mui": "@mui",
    "@mui/material": "@mui/material",
    "@mui/material/esm": "@mui/material/esm",
    'styled-components': 'styled-components',
    'xml-formatter': 'xml-formatter',
    'lodash-es': 'lodash-es',
  },
    /^@mui/,
    /^lodash/
    
  ],
};

module.exports = merge(common, prodConfig);
