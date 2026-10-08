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

/**
 * The application route table: which page each path renders, behind which
 * layout, with which loader and error element. react-router itself is replaced
 * by `mock-router.tsx` (it is ESM-only), and every page by a named stub.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router', () => jest.requireActual('./mock-router'));

const mockStub = (name: string) => ({
  __esModule: true,
  default: () => {
    const ReactActual = jest.requireActual<typeof React>('react');
    return ReactActual.createElement('div', null, name);
  },
});

jest.mock('../../../src/components/forgot-password-success-page', () =>
  mockStub('forgot-password-success-page'),
);
jest.mock('../../../src/components/reset-password-page', () => mockStub('reset-password-page'));
jest.mock('../../../src/components/registration-page', () => mockStub('registration-page'));
jest.mock('../../../src/components/login-page', () => mockStub('login-page'));
jest.mock('../../../src/components/forgot-password-page', () => ({
  ForgotPasswordPage: () => 'forgot-password-page',
}));
jest.mock('../../../src/components/registration-success-page', () =>
  mockStub('registration-success-page'),
);
jest.mock('../../../src/components/activation-page', () => mockStub('activation-page'));
jest.mock('../../../src/components/oauth-callback', () => mockStub('oauth-callback-page'));
jest.mock('../../../src/components/error-page', () => mockStub('error-page'));
jest.mock('../../../src/components/loading-fallback', () => mockStub('loading-fallback'));
jest.mock('../../../src/components/maps-page/maps-list/MapsListSkeleton', () => ({
  MapsPageLoading: () => 'maps-page-loading',
}));
jest.mock('../../../src/components/maps-page/MapsPageErrorFallback', () =>
  mockStub('maps-page-error-fallback'),
);
jest.mock('@wisemapping/editor', () => ({ EditorLoadingSkeleton: () => 'editor-loading' }));
jest.mock('../../../src/components/seo', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../../../src/components/editor-page/loader', () => ({
  loader: (mode: string, bootstrap: boolean) => `map-loader:${mode}:${bootstrap}`,
}));
jest.mock('../../../src/loader', () => ({ loader: 'config-loader' }));
jest.mock('../../../src/components/common-page', () => {
  const { Outlet } = jest.requireActual('./mock-router');
  const ReactActual = jest.requireActual<typeof React>('react');
  return {
    __esModule: true,
    default: () =>
      ReactActual.createElement(
        'div',
        { 'data-testid': 'common-page' },
        ReactActual.createElement(Outlet),
      ),
  };
});
jest.mock('../../../src/components/redirect', () => ({
  __esModule: true,
  default: ({ to }: { to: string }) => `redirect:${to}`,
}));
jest.mock('../../../src/components/editor-page', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => `editor-page:${JSON.stringify(props)}`,
}));
jest.mock('../../../src/components/maps-page', () => mockStub('maps-page'));
jest.mock('../../../src/components/admin-console', () => mockStub('admin-console'));
jest.mock('../../../src/components/admin-console/layout', () => {
  const { Outlet } = jest.requireActual('./mock-router');
  const ReactActual = jest.requireActual<typeof React>('react');
  return {
    __esModule: true,
    default: () =>
      ReactActual.createElement(
        'div',
        { 'data-testid': 'admin-layout' },
        ReactActual.createElement(Outlet),
      ),
  };
});
jest.mock('../../../src/components/admin-console/accounts-page', () =>
  mockStub('admin-accounts-page'),
);
jest.mock('../../../src/components/admin-console/maps-page', () => mockStub('admin-maps-page'));
jest.mock('../../../src/components/admin-console/system-page', () => mockStub('admin-system-page'));
jest.mock('../../../src/contexts/ThemeContext', () => ({
  AppThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ mode: 'light' }),
}));

import App from '../../../src/app';
import AppConfig from '../../../src/classes/app-config';
import Client from '../../../src/classes/client';
import { lastMatch, RouteObject } from './mock-router';

const client = {
  fetchAccountInfo: jest.fn().mockResolvedValue({ email: 'ada@example.com' }),
  onSessionExpired: jest.fn(),
};

const renderAt = (url: string, { registration = true } = {}) => {
  window.history.pushState({}, '', url);
  jest.spyOn(AppConfig, 'isRegistrationEnabled').mockReturnValue(registration);
  jest.spyOn(AppConfig, 'getClient').mockReturnValue(client as unknown as Client);
  jest.spyOn(AppConfig, 'initialize').mockResolvedValue({} as never);
  return render(<App />);
};

/** The route that matched the path (the leaf of the chain). */
const leaf = (): RouteObject => {
  const chain = lastMatch.current?.chain ?? [];
  return chain[chain.length - 1];
};

const errorElementName = (route: RouteObject): string | undefined => {
  const el = route.errorElement as React.ReactElement<{ children?: React.ReactElement }>;
  if (!el) return undefined;
  // Most error elements are the generic page wrapped in the intl provider.
  const inner = el.props.children ?? el;
  return render(inner).container.textContent ?? undefined;
};

describe('App', () => {
  test('renders nothing until the configuration is loaded', () => {
    jest.spyOn(AppConfig, 'initialize').mockReturnValue(new Promise(() => undefined));
    const { container } = render(<App />);
    expect(container.textContent).toBe('');
  });

  test.each<[string, unknown, string]>([
    ['an error with a msg', { msg: 'Backend unavailable' }, 'Backend unavailable'],
    ['an Error', new Error('Config fetch failed'), 'Config fetch failed'],
    ['anything else', 'nope', 'Unable to load application configuration.'],
  ])('reports a configuration failure given %s', async (_name, error, message) => {
    jest.spyOn(AppConfig, 'initialize').mockRejectedValue(error);
    render(<App />);

    expect((await screen.findByRole('alert')).textContent).toBe(message);
  });

  test('ignores a configuration result that arrives after unmounting', async () => {
    let resolve: () => void = () => undefined;
    const buildSpy = jest.spyOn(AppConfig, 'isRegistrationEnabled');
    jest.spyOn(AppConfig, 'initialize').mockReturnValue(
      new Promise((r) => {
        resolve = () => r({} as never);
      }),
    );
    const { unmount } = render(<App />);
    unmount();
    resolve();
    await Promise.resolve();

    // The router (and its registration routes) is never built.
    expect(buildSpy).not.toHaveBeenCalled();
  });

  test('"/" redirects to the login page, and every route change refreshes the ads', async () => {
    const ads = window as unknown as { adsbygoogle?: unknown[] };
    ads.adsbygoogle = [];
    renderAt('/');

    expect(await screen.findByText('redirect:/c/login')).toBeTruthy();
    expect(ads.adsbygoogle.length).toBeGreaterThan(0);
    // Every page sits below the configuration loader.
    expect(lastMatch.current?.chain[1].loader).toBe('config-loader');
    expect(errorElementName(lastMatch.current!.chain[1])).toBe('error-page');
  });

  test.each([
    ['/c/login', 'login-page'],
    ['/es/c/login', 'login-page'],
    ['/fr/c/registration', 'registration-page'],
    ['/c/forgot-password', 'forgot-password-page'],
    ['/de/c/forgot-password', 'forgot-password-page'],
    ['/c/forgot-password-success', 'forgot-password-success-page'],
    ['/c/reset-password', 'reset-password-page'],
    ['/c/registration', 'registration-page'],
    ['/c/registration-google', 'oauth-callback-page'],
    ['/c/registration-facebook', 'oauth-callback-page'],
    ['/c/oauth-callback', 'oauth-callback-page'],
    ['/c/registration-success', 'registration-success-page'],
    ['/c/activation', 'activation-page'],
    ['/c/no-such-page', 'error-page'],
  ])('%s renders the %s', async (url, page) => {
    renderAt(url);
    expect(await screen.findByText(page)).toBeTruthy();
  });

  test.each(['/c/registration', '/c/registration-success', '/c/activation'])(
    '%s is not served when registration is disabled',
    async (url) => {
      renderAt(url, { registration: false });
      expect(await screen.findByText('error-page')).toBeTruthy();
    },
  );

  // "Sign in with Google/Facebook" is offered whatever the registration setting, and the
  // provider comes back to these pages: without them a closed registration broke OAuth sign-in.
  test.each(['/c/oauth-callback', '/c/registration-google', '/c/registration-facebook'])(
    '%s is served when registration is disabled',
    async (url) => {
      renderAt(url, { registration: false });
      expect(await screen.findByText('oauth-callback-page')).toBeTruthy();
    },
  );

  test('the localized registration page is served even with registration disabled', async () => {
    renderAt('/es/c/registration', { registration: false });
    expect(await screen.findByText('registration-page')).toBeTruthy();
  });

  test('the maps list is a lazy page inside the common page, with its own error fallback', async () => {
    renderAt('/c/maps/');

    expect(await screen.findByText('maps-page')).toBeTruthy();
    expect(screen.getByTestId('common-page')).toBeTruthy();
    expect(errorElementName(leaf())).toBe('maps-page-error-fallback');
  });

  test('/c/admin is the admin console entry', async () => {
    renderAt('/c/admin');
    expect(await screen.findByText('admin-console')).toBeTruthy();
    expect(screen.queryByTestId('admin-layout')).toBeNull();
  });

  test.each([
    ['/c/admin/accounts', 'admin-accounts-page'],
    ['/c/admin/maps', 'admin-maps-page'],
    ['/c/admin/system', 'admin-system-page'],
  ])('%s renders the %s inside the admin layout', async (url, page) => {
    renderAt(url);

    expect(await screen.findByText(page)).toBeTruthy();
    expect(screen.getByTestId('admin-layout').textContent).toBe(page);
    expect(screen.getByTestId('common-page')).toBeTruthy();
  });

  test.each([
    ['/c/maps/12/edit', 'edit', { pageMode: 'edit', mapId: 12 }],
    ['/c/maps/12/edit?zoom=1.5', 'edit', { pageMode: 'edit', mapId: 12, zoom: 1.5 }],
    ['/c/maps/12/print', 'view-private', { pageMode: 'view-private', mapId: 12 }],
    ['/c/maps/12/7/view', 'view-private', { pageMode: 'view-private', mapId: 12, hid: 7 }],
    ['/c/maps/12/public', 'view-public', { pageMode: 'view-public', mapId: 12 }],
    ['/c/maps/12/embed', 'view-public', { pageMode: 'view-public', mapId: 12 }],
    ['/c/maps/12/try', 'try', { pageMode: 'try', mapId: 12 }],
  ])('%s opens the editor in %s mode', async (url, mode, props) => {
    renderAt(url);

    const editor = await screen.findByText(/^editor-page:/);
    expect(JSON.parse(editor.textContent!.slice('editor-page:'.length))).toEqual(props);
    expect(leaf().loader).toBe(`map-loader:${mode}:true`);
    expect(errorElementName(leaf())).toBe('error-page');
  });
});
