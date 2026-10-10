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
import { fireEvent, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

jest.mock('react-router', () => jest.requireActual('../router-mock'));
jest.mock('@wisemapping/editor', () => ({
  EditorLoadingSkeleton: () => <div>editor skeleton</div>,
}));

import Header, { SignInButton } from '../../../../src/components/layout/header';
import Footer from '../../../../src/components/layout/footer';
import LoadingFallback from '../../../../src/components/loading-fallback';
import { createAppTheme } from '../../../../src/theme';
import { renderWithProviders } from '../../helpers/render';
import { installMatchMedia, renderPage } from '../helpers';
import { setLocation } from '../router-mock';

const hrefs = (name: string): (string | null)[] =>
  screen.queryAllByRole('link', { name }).map((link) => link.getAttribute('href'));

describe('Header', () => {
  test('"only-signup" invites to sign up', () => {
    renderWithProviders(<Header type="only-signup" />);
    expect(screen.getByText("Don't have an account ?")).toBeTruthy();
    expect(hrefs('Sign Up')).toEqual(['/c/registration']);
    expect(hrefs('Sign In')).toEqual([]);
  });

  test('"only-signin" invites to sign in', () => {
    renderWithProviders(<Header type="only-signin" />);
    expect(screen.getByText('Already have an account?')).toBeTruthy();
    expect(hrefs('Sign In')).toEqual(['/c/login']);
    expect(hrefs('Sign Up')).toEqual([]);
  });

  test('"none" shows only the logo, linking to login', () => {
    renderWithProviders(<Header type="none" />);
    expect(hrefs('WiseMapping logo')).toEqual(['/c/login']);
    expect(hrefs('Sign In')).toEqual([]);
    expect(hrefs('Sign Up')).toEqual([]);
  });

  test('an unknown type offers both buttons', () => {
    renderWithProviders(<Header type={'both' as 'none'} />);
    expect(hrefs('Sign In')).toEqual(['/c/login']);
    expect(hrefs('Sign Up')).toEqual(['/c/registration']);
  });

  test('renders the logo, linking to login, on the dark theme too', () => {
    // Asset imports are stubbed, so which of the two logos is used can not be told apart here.
    renderWithProviders(
      <ThemeProvider theme={createAppTheme('dark')}>
        <Header type="none" />
      </ThemeProvider>,
    );
    expect(hrefs('WiseMapping logo')).toEqual(['/c/login']);
  });

  test('SignInButton links to login', () => {
    renderWithProviders(<SignInButton className="x" />);
    expect(hrefs('Sign In')).toEqual(['/c/login']);
  });
});

describe('Footer', () => {
  beforeEach(() => {
    installMatchMedia(false);
    localStorage.clear();
  });

  test('shows the copyright of the current year and the support links', () => {
    renderPage(<Footer />);

    expect(screen.getByText(`© ${new Date().getFullYear()} WiseMapping LLC`)).toBeTruthy();
    expect(hrefs('Contact Us')).toEqual(['mailto:team@wisemapping.com']);
    expect(hrefs('Privacy Policy')).toEqual(['https://www.wisemapping.com/privacy']);
    expect(hrefs('Donate')).toEqual([
      'https://www.paypal.com/donate/?hosted_button_id=CF7GJ7T6E4RS4',
    ]);
  });

  test('carries the theme switch', () => {
    renderPage(<Footer />);

    fireEvent.click(screen.getByRole('switch'));

    expect(localStorage.getItem('themeMode')).toBe('dark');
    expect(screen.getByText('Dark')).toBeTruthy();
  });
});

describe('LoadingFallback', () => {
  test('outside the editor and the map list shows a spinner', () => {
    setLocation('/c/admin');
    renderWithProviders(<LoadingFallback />);
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  test.each(['/c/maps', '/c/maps/'])('on the map list %s shows its skeleton', (path) => {
    // The same skeleton the map list keeps up while it loads: one skeleton, then the page.
    setLocation(path);
    renderWithProviders(<LoadingFallback />);
    expect(screen.queryByText('Loading...')).toBeNull();
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  test.each(['/c/maps/12', '/c/maps/12/edit'])(
    'on the editor route %s shows the editor skeleton',
    (path) => {
      setLocation(path);
      renderWithProviders(<LoadingFallback />);
      expect(screen.getByText('editor skeleton')).toBeTruthy();
      expect(screen.queryByText('Loading...')).toBeNull();
    },
  );
});
