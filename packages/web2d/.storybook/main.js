const {
  dirname,
  join
} = require("node:path");

module.exports = {
  stories: [
    "../storybook/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/html-vite"),
    options: {}
  },
  docs: {
    defaultName: "Documentation"
  },
  viteFinal: async (config) => {
    return config;
  }
}

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}