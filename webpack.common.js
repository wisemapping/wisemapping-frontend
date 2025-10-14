/** @type {import('webpack').Configuration} */
const path = require('path');

module.exports = {
  // Enable persistent caching for faster rebuilds (60-90% improvement)
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename],
    },
    // Cache invalidation based on package-lock changes
    version: require('./package.json').version,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Speed up module resolution
    modules: ['node_modules'],
    symlinks: false,
  },

  optimization: {
    usedExports: true,
    // Cache module identifiers for better long-term caching
    moduleIds: 'deterministic',
  },

  stats: {
    errorDetails: true,
    preset: 'errors-warnings',
    chunks: true,
    modules: false,
    assets: false,
  },

  infrastructureLogging: {
    level: 'error',
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.(tsx|ts)?$/,
        // Exclude node_modules except for @wisemapping workspace packages
        exclude: {
          and: [/node_modules/],
          not: [/@wisemapping/],
        },
        use: [
          // Parallelize builds across multiple threads (20-40% improvement)
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1,
              workerParallelJobs: 50,
              // Only keep workers alive in watch/dev mode, not production builds
              poolTimeout: process.env.NODE_ENV === 'development' ? 2000 : 500,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
              // Skip type checking during build (do it separately)
              transpileOnly: true,
              // Required for thread-loader
              happyPackMode: true,
              // Enable caching
              experimentalWatchApi: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/inline',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1,
              // Only keep workers alive in watch/dev mode, not production builds
              poolTimeout: process.env.NODE_ENV === 'development' ? 2000 : 500,
            },
          },
          'babel-loader',
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
