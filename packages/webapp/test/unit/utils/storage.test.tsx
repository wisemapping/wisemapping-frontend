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

import React from 'react';
import { render, screen } from '@testing-library/react';
import AppI18n from '../../../src/classes/app-i18n';
import { AppThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';
import { readStorage, removeStorage, writeStorage } from '../../../src/utils/storage';

/**
 * A browser that blocks site storage (an embedded map in a third-party iframe under "block
 * third-party cookies", some private modes) throws a SecurityError on any localStorage access.
 */
const blockStorage = (): void => {
  const denied = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(denied);
};

describe('blocked browser storage', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  test('reads as empty and ignores writes', () => {
    blockStorage();
    expect(readStorage('themeMode')).toBeNull();
    expect(() => writeStorage('themeMode', 'dark')).not.toThrow();
    expect(() => removeStorage('themeMode')).not.toThrow();
  });

  test('the locale falls back to the browser one', () => {
    blockStorage();
    expect(() => AppI18n.getDefaultLocale()).not.toThrow();
  });

  test('the theme provider renders, with the system theme', () => {
    blockStorage();
    const Mode = (): React.ReactElement => <span>{useTheme().mode}</span>;

    render(
      <AppThemeProvider>
        <Mode />
      </AppThemeProvider>,
    );

    expect(screen.getByText('light')).toBeTruthy();
  });
});
