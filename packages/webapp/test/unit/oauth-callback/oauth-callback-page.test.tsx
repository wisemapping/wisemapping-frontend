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
import { act, screen } from '@testing-library/react';

jest.mock('react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useLocation: () => ({ pathname: '/c/registration-google' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({ initializeThemeFromSystem: jest.fn(), mode: 'light' }),
}));
jest.mock('../../../src/components/layout/header', () => () => null);
jest.mock('../../../src/components/layout/footer', () => () => null);
jest.mock('../../../src/utils/analytics', () => ({
  trackPageView: jest.fn(),
  setAnalyticsUserEmail: jest.fn(),
}));

import OAuthCallbackPage from '../../../src/components/oauth-callback';
import Client from '../../../src/classes/client';
import { trackPageView } from '../../../src/utils/analytics';
import { renderWithProviders } from '../helpers/render';

const client = {} as unknown as Client;

// Renders the page and returns a function that renders it again, inside the same providers.
const renderPage = (): (() => void) => {
  let rerenderPage = (): void => undefined;
  const Page = (): React.ReactElement => {
    const [, setRenders] = React.useState(0);
    rerenderPage = () => act(() => setRenders((renders) => renders + 1));
    return <OAuthCallbackPage />;
  };
  renderWithProviders(<Page />, { client });
  return () => rerenderPage();
};

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    jest.mocked(trackPageView).mockClear();
    // A provider error keeps the page away from the client and makes it render twice on arrival.
    window.history.pushState({}, '', '/c/registration-google?error=server_error');
  });

  test('tracks one page view however often the page re-renders', () => {
    const rerender = renderPage();
    expect(screen.getByText('OAuth error: server_error')).toBeTruthy();

    rerender();
    rerender();

    expect(trackPageView).toHaveBeenCalledTimes(1);
    expect(trackPageView).toHaveBeenCalledWith('/c/registration-google', 'Registration:Success');
  });

  test('sets the page title', () => {
    renderPage();
    expect(document.title).toBe('Registation Success | WiseMapping');
  });
});
