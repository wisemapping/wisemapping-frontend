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

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}