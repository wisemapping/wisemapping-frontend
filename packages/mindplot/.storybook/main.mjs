import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    "../storybook/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../size-test/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@wisemapping/web2d': join(__dirname, '../../web2d')
        },
      },
    });
  },
};
export default config;