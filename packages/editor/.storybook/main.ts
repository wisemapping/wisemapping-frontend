import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  core: {
    builder: "@storybook/builder-webpack5",
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {} as any;
    (config.resolve as any).alias = {
      ...((config.resolve as any).alias || {}),
      '@wisemapping/mindplot/src/components/DesignerKeyboard':
        '/Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor/.storybook/mocks/DesignerKeyboard.ts',
      '@wisemapping/mindplot/src/components/theme/ThemeStyle.ts':
        '/Users/pveiga/repos/wiseapp/wisemapping-frontend/packages/editor/.storybook/mocks/ThemeStyle.ts',
    };
    (config.resolve as any).extensions = Array.from(
      new Set([...(config.resolve?.extensions || []), '.ts', '.tsx', '.js', '.jsx'])
    );
    return config;
  },
};

export default config;


