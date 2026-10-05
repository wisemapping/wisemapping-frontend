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
import { render, RenderResult } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { EditorThemeProvider } from '../../../src/contexts/ThemeContext';
import type { ThemeVariantStorage } from '../../../src/types/ThemeVariantStorage';

export type Mode = 'light' | 'dark';

/** A NodeProperty fake whose getter returns `value` and whose setter/switch are spies. */
export type FakeProperty<T> = {
  getValue: jest.Mock<T, []>;
  setValue: jest.Mock<void, [T]>;
  switchValue: jest.Mock<void, [unknown?]>;
};

export const property = <T,>(value: T): FakeProperty<T> => ({
  getValue: jest.fn<T, []>(() => value),
  setValue: jest.fn<void, [T]>(),
  switchValue: jest.fn<void, [unknown?]>(),
});

/** A read-only NodeProperty: the editor cannot change it. */
export const readOnlyProperty = <T,>(value: T): { getValue: () => T } => ({
  getValue: () => value,
});

const storage = (mode: Mode): ThemeVariantStorage => ({
  getThemeVariant: () => mode,
  setThemeVariant: () => undefined,
  subscribe: () => () => undefined,
});

/**
 * Renders a pane the way the editor hosts it: an English IntlProvider, the editor's own
 * light/dark context, and a MUI theme of the same mode.
 */
export const renderPane = (ui: ReactElement, mode: Mode = 'light'): RenderResult => {
  const wrap = (node: ReactNode): ReactElement => (
    <IntlProvider locale="en" messages={{}}>
      <EditorThemeProvider themeVariantStorage={storage(mode)}>
        <ThemeProvider theme={createTheme({ palette: { mode } })}>{node}</ThemeProvider>
      </EditorThemeProvider>
    </IntlProvider>
  );
  const result = render(wrap(ui));
  return {
    ...result,
    rerender: (next: ReactNode) => result.rerender(wrap(next)),
  };
};
