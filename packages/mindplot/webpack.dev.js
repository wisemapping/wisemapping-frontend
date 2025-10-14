const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const devConfig = {
  mode: 'development',
  // Use faster source maps for development (10x faster than 'source-map')
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    historyApiFallback: true,
    port: 8080,
    open: true,
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    // Run TypeScript type checking in a separate process (non-blocking)
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: './tsconfig.json',
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  // Monitor build performance
  performance: {
    hints: false, // Disable for dev builds
  },
};

module.exports = merge(common, devConfig);
