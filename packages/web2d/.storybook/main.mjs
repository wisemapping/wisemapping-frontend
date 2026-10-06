import { dirname } from 'path';
import { fileURLToPath } from 'url';

const getAbsolutePath = (value) =>
  dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));

export default {
  stories: ['../storybook/src/**/*.stories.ts'],
  addons: [getAbsolutePath('@storybook/addon-links'), getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/html-vite'),
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
};
