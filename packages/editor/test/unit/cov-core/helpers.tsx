/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React, { ReactElement, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from '@mui/material/styles';
import { act } from '@testing-library/react';
import { EditorThemeProvider } from '../../../src/contexts/ThemeContext';
import { createEditorTheme } from '../../../src/theme';
import type { ThemeVariantStorage } from '../../../src/types/ThemeVariantStorage';

type Variant = 'light' | 'dark';

/** An in-memory ThemeVariantStorage whose subscribers can be notified from a test. */
export const createThemeStorage = (
  initial: Variant = 'light',
): ThemeVariantStorage & {
  setThemeVariant: jest.Mock;
  emit: (variant: Variant) => void;
  subscriberCount: () => number;
} => {
  let current: Variant = initial;
  let subscribers: ((variant: Variant) => void)[] = [];
  return {
    getThemeVariant: () => current,
    setThemeVariant: jest.fn((variant: Variant) => {
      current = variant;
    }),
    subscribe: (callback: (variant: Variant) => void) => {
      subscribers = [...subscribers, callback];
      return () => {
        subscribers = subscribers.filter((s) => s !== callback);
      };
    },
    emit: (variant: Variant) => {
      current = variant;
      act(() => {
        subscribers.forEach((s) => s(variant));
      });
    },
    subscriberCount: () => subscribers.length,
  };
};

/** Theme context + MUI theme + an English IntlProvider, as the Editor sets them up. */
export const Providers = ({
  children,
  storage = createThemeStorage(),
}: {
  children: ReactNode;
  storage?: ThemeVariantStorage;
}): ReactElement => (
  <EditorThemeProvider themeVariantStorage={storage}>
    <ThemeProvider theme={createEditorTheme(storage.getThemeVariant())}>
      <IntlProvider locale="en" messages={{}} onError={() => undefined}>
        {children}
      </IntlProvider>
    </ThemeProvider>
  </EditorThemeProvider>
);
