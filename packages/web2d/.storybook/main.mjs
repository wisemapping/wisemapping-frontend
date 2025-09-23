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
    // Ensure proper module resolution for TypeScript
    config.resolve = config.resolve || {};
    config.resolve.extensions = config.resolve.extensions || [];
    
    // Add TypeScript extensions
    if (!config.resolve.extensions.includes('.ts')) {
      config.resolve.extensions.push('.ts');
    }
    
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
    
    // Add rule for SVG/PNG assets using asset/inline
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