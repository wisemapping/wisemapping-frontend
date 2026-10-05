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

// react-router is ESM-only (see jest.config.js): stand in for the route-error hooks.
type RouteErrorResponse = { status: number; statusText: string; internal: true };
let mockRouteError: unknown;
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouteError: () => mockRouteError,
  isRouteErrorResponse: (error: unknown) =>
    typeof error === 'object' && error !== null && 'internal' in error,
}));

// The generic error page has its own suite.
jest.mock('../../../../src/components/error-page', () => ({
  __esModule: true,
  default: () => <div>generic-error-page</div>,
}));

const mockTrackPageView = jest.fn();
jest.mock('../../../../src/utils/analytics', () => ({
  trackPageView: (...args: unknown[]) => mockTrackPageView(...args),
}));

import MapsPageErrorFallback from '../../../../src/components/maps-page/MapsPageErrorFallback';
import { renderWithWrapper } from '../providers';

const routeError = (status: number, statusText = ''): RouteErrorResponse => ({
  status,
  statusText,
  internal: true,
});

describe('MapsPageErrorFallback', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockTrackPageView.mockClear();
    document.title = '';
  });

  test.each<[string, unknown]>([
    ['a 500 route error', routeError(500, 'Server Error')],
    ['an ErrorInfo without auth status', { msg: 'Database down', status: 500 }],
    ['a plain Error', new Error('boom')],
    ['nothing', undefined],
  ])('falls back to the generic error page for %s', (_name, error) => {
    mockRouteError = error;
    renderWithWrapper(<MapsPageErrorFallback />);

    expect(screen.getByText('generic-error-page')).toBeTruthy();
    expect(screen.queryByText('Sign in to access your maps')).toBeNull();
    expect(mockTrackPageView).not.toHaveBeenCalled();
  });

  test.each<[string, unknown]>([
    ['a 401 route error', routeError(401)],
    ['a 403 route error', routeError(403)],
    ['a 401 ErrorInfo', { status: 401 }],
    ['an ErrorInfo flagged isAuth', { isAuth: true, msg: '  ' }],
  ])('asks the user to sign in for %s', (_name, error) => {
    mockRouteError = error;
    renderWithWrapper(<MapsPageErrorFallback />);

    expect(screen.getByRole('heading', { name: 'Sign in to access your maps' })).toBeTruthy();
    expect(screen.getByText('You need to sign in to view your maps.')).toBeTruthy();
    expect(document.title).toBe('Sign In Required | WiseMapping');
    expect(mockTrackPageView).toHaveBeenCalledWith(
      window.location.pathname,
      'MapsPageAuthRequired',
    );
  });

  test('shows the server message of an auth ErrorInfo', () => {
    mockRouteError = { status: 403, msg: 'Your session expired' };
    renderWithWrapper(<MapsPageErrorFallback />);

    expect(screen.getByText('Your session expired')).toBeTruthy();
  });

  test('shows the status text of an auth route error', () => {
    mockRouteError = routeError(401, 'Unauthorized');
    renderWithWrapper(<MapsPageErrorFallback />);

    expect(screen.getByText('Unauthorized')).toBeTruthy();
  });

  test('a non-numeric status on an ErrorInfo is not treated as auth', () => {
    mockRouteError = { status: '401', fields: {} };
    renderWithWrapper(<MapsPageErrorFallback />);

    expect(screen.getByText('generic-error-page')).toBeTruthy();
  });

  test('"Go to login" takes the user to the login page', () => {
    mockRouteError = routeError(401);
    renderWithWrapper(<MapsPageErrorFallback />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to login' }));
    expect(mockNavigate).toHaveBeenCalledWith('/c/login');
  });
});
