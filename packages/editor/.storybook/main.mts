import type { StorybookConfig } from "@storybook/react-vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: undefined,
      },
    },
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    // Add wxml loader plugin
    const wxmlLoader = () => {
      return {
        name: 'wxml-loader',
        transform(code: string, id: string) {
          if (id.endsWith('.wxml')) {
            return {
              code: `export default ${JSON.stringify(code)};`,
              map: null,
            };
          }
        },
      };
    };

    config.plugins = config.plugins || [];
    config.plugins.push(wxmlLoader());

    // Include .wxml files as assets
    config.assetsInclude = config.assetsInclude || [];
    if (Array.isArray(config.assetsInclude)) {
      config.assetsInclude.push('**/*.wxml');
    }

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@wisemapping/mindplot/src/components/DesignerKeyboard': path.resolve(__dirname, './mocks/DesignerKeyboard.ts'),
      '@wisemapping/mindplot/src/components/theme/ThemeStyle': path.resolve(__dirname, './mocks/ThemeStyle.ts'),
      // Add explicit alias for MUI icons to fix workspace resolution
      '@mui/icons-material': path.resolve(__dirname, '../../../node_modules/@mui/icons-material'),
    };

    // Add dedupe for MUI packages to fix workspace resolution
    config.resolve.dedupe = config.resolve.dedupe || [];
    config.resolve.dedupe.push('@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled');

    return config;
  },
};

export default config;
