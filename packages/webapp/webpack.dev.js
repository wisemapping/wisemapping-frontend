/* eslint-disable no-undef */
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

require('ts-node').register({
  transpileOnly: true,
  project: path.join(__dirname, 'tsconfig.json'),
});

// Get the config from the common file
let config;
switch (process.env.APP_CONFIG_TYPE) {
  case 'file:mock': {
    config = JSON.stringify(require('./config.mock.json'));
    break;
  }
  case 'file:prod': {
    config = JSON.stringify(require('./config.prod.json'));
    break;
  }
  case 'file:dev': {
    config = JSON.stringify(require('./config.dev.json'));
    break;
  }
  case 'remote': {
    config = process.env.APP_CONFIG_JSON;
    break;
  }
  default: {
    config = JSON.stringify(require('./config.mock.json'));
    break;
  }
}

module.exports = merge(common, {
  mode: 'development',
  // Use faster source maps for development (10x faster than 'source-map')
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    port: process.env.PORT || 3000,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false, // Don't show overlay for warnings in tests
      },
    },
    proxy: [
      {
        context: ['/api'],
        target: {
          host: '0.0.0.0',
          protocol: 'http:',
          port: 8080,
        },
      },
    ],
    historyApiFallback: {
      rewrites: [
        { from: /^\/(en|es|fr|de|ru|uk|zh|zh-CN|ja|pt|it|hi)\/c\//, to: '/index.html' },
        { from: /^\/c\//, to: '/index.html' },
      ],
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (devServer?.app) {
        // Use the same logic as the API route - import utils directly
        const { buildStaticUrls, generateSitemapXml } = require('./src/components/sitemap/utils');

        const handleSitemapRequest = (req, res) => {
          try {
            const host = req.get('host') || 'localhost:3000';
            const protocol =
              req.get('x-forwarded-proto') || (devServer.options.https ? 'https' : 'http');
            const baseUrl = `${protocol}://${host}`;
            const urls = buildStaticUrls({ baseUrl });
            const xml = generateSitemapXml(urls);

            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            res.status(200).send(xml);
          } catch (error) {
            console.error('Failed to serve sitemap from dev server', error);
            res.status(500).send('Unable to generate sitemap');
          }
        };

        // Handle /sitemap.xml - same as production rewrite
        devServer.app.get('/sitemap.xml', handleSitemapRequest);

        // Also handle /api/sitemap directly (for consistency)
        devServer.app.get('/api/sitemap', handleSitemapRequest);
      }

      return middlewares;
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      templateParameters: {
        GOOGLE_ADDS_ENABLED: false,
        NEW_RELIC_ENABLED: false,
      },
      base: process.env.PUBLIC_URL ? process.env.PUBLIC_URL : 'http://localhost:3000',
    }),
    new (require('webpack').DefinePlugin)({
      'window.BoostrapConfig': config,
    }),
    // Run TypeScript type checking in a separate process (non-blocking)
    new ForkTsCheckerWebpackPlugin({
      async: {
        concurrency: 2,
      },
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
});
