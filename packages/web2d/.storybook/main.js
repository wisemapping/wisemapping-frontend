module.exports = {
  stories: [
    "../storybook/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  babel: async (options) => ({
    ...options,
    presets: [
      ...(options.presets || []),
      ["@babel/preset-typescript", { allowDeclareFields: true }]
    ]
  }),
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-typescript', { allowDeclareFields: true }]
            ]
          }
        }
      ]
    });
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  }
}