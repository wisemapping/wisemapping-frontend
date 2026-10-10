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
import { act, render } from '@testing-library/react';
import { AppThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';

describe('AppThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  test('keeps the same context value while nothing in it changes', () => {
    // A new object on every render re-rendered every consumer of the theme context each time
    // the provider's parent did.
    const seen: unknown[] = [];
    const Probe = (): React.ReactElement => {
      seen.push(useTheme());
      return <span />;
    };
    const Parent = ({ tick }: { tick: number }): React.ReactElement => (
      <AppThemeProvider>
        <span>{tick}</span>
        <Probe />
      </AppThemeProvider>
    );

    const view = render(<Parent tick={1} />);
    view.rerender(<Parent tick={2} />);

    expect(seen.length).toBeGreaterThanOrEqual(1);
    expect(new Set(seen).size).toBe(1);
  });

  test('toggling changes the mode, and the value with it', () => {
    let current: ReturnType<typeof useTheme> | undefined;
    const Probe = (): React.ReactElement => {
      current = useTheme();
      return <span />;
    };
    render(
      <AppThemeProvider>
        <Probe />
      </AppThemeProvider>,
    );
    const before = current;

    act(() => current?.toggleMode());

    expect(before?.mode).toBe('light');
    expect(current?.mode).toBe('dark');
    expect(current).not.toBe(before);
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });
});
