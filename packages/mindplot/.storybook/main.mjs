export default {
  stories: [
    "../storybook/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-vite",
    options: {}
  },
  docs: {
    defaultName: "Documentation"
  },
  viteFinal: async (config) => {
    // Ensure proper module resolution for monorepo packages
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Use relative path instead of absolute path for better portability
    config.resolve.alias['@wisemapping/web2d'] = require('path').resolve(__dirname, '../../web2d/src/index.ts');
    config.resolve.alias['@wisemapping/core-js'] = require('path').resolve(__dirname, '../../core-js/src/index.ts');
    
    // Enable dependency pre-bundling for better module resolution
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = config.optimizeDeps.include || [];
    config.optimizeDeps.include.push('@wisemapping/web2d', '@wisemapping/core-js');
    
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