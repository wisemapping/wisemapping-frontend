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
import { act, fireEvent, render, screen } from '@testing-library/react';
import { AppThemeProvider, useTheme } from '../../../../src/contexts/ThemeContext';
import ThemeToggle from '../../../../src/components/common/theme-toggle';
import ThemeToggleButton from '../../../../src/components/common/theme-toggle-button';
import { renderWithProviders } from '../../helpers/render';
import { installMatchMedia } from '../helpers';

const Probe = (): React.ReactElement => {
  const { mode, toggleMode, initializeThemeFromSystem } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={toggleMode}>
        toggle
      </button>
      <button type="button" onClick={initializeThemeFromSystem}>
        from system
      </button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <AppThemeProvider>
      <Probe />
    </AppThemeProvider>,
  );

const mode = (): string => screen.getByTestId('mode').textContent ?? '';

describe('AppThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts light when the system has no dark preference', () => {
    installMatchMedia(false);
    renderProbe();
    expect(mode()).toBe('light');
  });

  test('follows a dark system preference', () => {
    installMatchMedia(true);
    renderProbe();
    expect(mode()).toBe('dark');
  });

  test('a saved choice wins over the system preference', () => {
    installMatchMedia(true);
    localStorage.setItem('themeMode', 'light');
    renderProbe();
    expect(mode()).toBe('light');
  });

  test('toggling switches the mode and remembers it', () => {
    installMatchMedia(false);
    renderProbe();

    fireEvent.click(screen.getByText('toggle'));
    expect(mode()).toBe('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');

    fireEvent.click(screen.getByText('toggle'));
    expect(mode()).toBe('light');
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  test('initialising from the system stores the system mode when nothing was chosen', () => {
    installMatchMedia(false);
    renderProbe();
    expect(mode()).toBe('light');
    // The system now prefers dark, without having told the page.
    installMatchMedia(true);

    fireEvent.click(screen.getByText('from system'));

    expect(mode()).toBe('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  test('initialising from the system keeps a saved choice', () => {
    installMatchMedia(true);
    localStorage.setItem('themeMode', 'light');
    renderProbe();

    fireEvent.click(screen.getByText('from system'));

    expect(mode()).toBe('light');
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  test('follows system changes until the user chooses a mode', () => {
    const media = installMatchMedia(false);
    const view = renderProbe();

    act(() => media.setSystemDark(true));
    expect(mode()).toBe('dark');
    act(() => media.setSystemDark(false));
    expect(mode()).toBe('light');

    fireEvent.click(screen.getByText('toggle'));
    act(() => media.setSystemDark(false));
    expect(mode()).toBe('dark');

    view.unmount();
    expect(media.listeners).toHaveLength(0);
  });

  test('useTheme outside the provider is an error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow('useTheme must be used within an AppThemeProvider');
  });
});

describe('theme toggles', () => {
  beforeEach(() => {
    localStorage.clear();
    installMatchMedia(false);
  });

  const withTheme = (ui: React.ReactElement) =>
    renderWithProviders(<AppThemeProvider>{ui}</AppThemeProvider>);

  test('ThemeToggle switches between light and dark', () => {
    withTheme(<ThemeToggle />);
    const toggle = screen.getByRole('switch') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(screen.getByText('Light')).toBeTruthy();

    fireEvent.click(toggle);

    expect(toggle.checked).toBe(true);
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  test('ThemeToggle starts dark on a dark preference', () => {
    localStorage.setItem('themeMode', 'dark');
    withTheme(<ThemeToggle showBackground={true} />);
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
  });

  test('ThemeToggleButton shows the current mode and toggles it', () => {
    withTheme(<ThemeToggleButton />);
    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    expect(button.textContent).toBe('Light');

    fireEvent.click(button);

    expect(button.textContent).toBe('Dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });
});
