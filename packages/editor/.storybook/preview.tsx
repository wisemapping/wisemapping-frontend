import React from 'react';
import { IntlProvider } from 'react-intl';
import { EditorThemeProvider } from '../src/contexts/ThemeContext';
import { MockThemeVariantStorage } from './mocks/ThemeVariantStorage';
import enMessages from '../src/compiled-lang/en.json';

const mockThemeStorage = new MockThemeVariantStorage();

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
  decorators: [
    (Story) => (
      <EditorThemeProvider themeVariantStorage={mockThemeStorage}>
        <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
          <Story />
        </IntlProvider>
      </EditorThemeProvider>
    ),
  ],
};

export default preview;


