export default {
  stories: [
    "../storybook/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {}
  },
  docs: {
    defaultName: "Documentation"
  },
  webpackFinal: async (config) => {
    // Reduce webpack verbosity
    config.stats = {
      ...config.stats,
      preset: 'errors-warnings',
      chunks: true,
      modules: false,
      assets: false,
    };
    config.infrastructureLogging = {
      level: 'error',
    };

    // Ensure proper module resolution for monorepo packages
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.extensions = config.resolve.extensions || [];
    
    // Add TypeScript extensions
    if (!config.resolve.extensions.includes('.ts')) {
      config.resolve.extensions.push('.ts');
    }
    
    // Use relative path instead of absolute path for better portability
    config.resolve.alias['@wisemapping/web2d'] = require('path').resolve(__dirname, '../../web2d/src/index.ts');
    config.resolve.alias['@wisemapping/core-js'] = require('path').resolve(__dirname, '../../core-js/src/index.ts');
    
    // Add webpack rules for handling assets and TypeScript
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add TypeScript loader
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: require('path').resolve(__dirname, '../tsconfig.json'),
          },
        },
      ],
      exclude: /node_modules/,
    });
    
    // Filter out existing asset rules that might conflict
    config.module.rules = config.module.rules.filter(rule => {
      // Remove rules that handle svg/png that might have invalid generator config
      if (rule.test && rule.test.toString().includes('svg')) {
        return false;
      }
      return true;
    });
    
    // Add rule for SVG/PNG assets using asset/inline (same as main webpack config)
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/,
      type: 'asset/inline',
    });
    
    return config;
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};