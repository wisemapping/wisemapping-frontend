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
};