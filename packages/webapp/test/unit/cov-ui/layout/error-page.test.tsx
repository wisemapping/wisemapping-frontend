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

jest.mock('react-router', () => jest.requireActual('../router-mock'));
jest.mock('../../../../src/utils/analytics', () => ({ trackPageView: jest.fn() }));
jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  logCriticalError: jest.fn(),
}));

import ErrorPage from '../../../../src/components/error-page';
import { logCriticalError } from '../../../../src/utils';
import { trackPageView } from '../../../../src/utils/analytics';
import { renderWithProviders } from '../../helpers/render';
import { resetRouter, routeErrorResponse, routerState, setLocation } from '../router-mock';

const showError = (error: unknown) => {
  routerState.routeError = error;
  return renderWithProviders(<ErrorPage />);
};

const heading = (): string => screen.getByRole('heading', { level: 1 }).textContent ?? '';

describe('ErrorPage', () => {
  beforeEach(() => {
    resetRouter();
    setLocation('/c/broken');
    jest.mocked(logCriticalError).mockClear();
    jest.mocked(trackPageView).mockClear();
  });

  test('an unknown route is a page not found, with home and back buttons', () => {
    showError(undefined);

    expect(heading()).toBe("We can't find that page.");
    expect(screen.getByText(/might have been removed/)).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith('Page not found error (catch-all route).', '404');
    expect(document.title).toBe('Unexpected Error | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/broken', 'ErrorPage');

    fireEvent.click(screen.getByRole('button', { name: 'Go to Home' }));
    expect(routerState.navigate).toHaveBeenLastCalledWith('/c/maps/');
    fireEvent.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(routerState.navigate).toHaveBeenLastCalledWith(-1);
  });

  test('a 404 response is a page not found', () => {
    showError(routeErrorResponse(404, 'Not Found'));

    expect(heading()).toBe("We can't find that page.");
    // The status text of a 404 is not shown, the friendly explanation is.
    expect(screen.queryByText('Not Found')).toBeNull();
    expect(logCriticalError).toHaveBeenCalledWith('Page not found error.', '404');
  });

  test('a 410 explains the map is not available for public display', () => {
    showError(routeErrorResponse(410, 'Gone', 'gone'));

    expect(heading()).toBe('This mindmap is not available for public display.');
    expect(screen.getByText(/violates our site policies/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go to Home' })).toBeTruthy();
  });

  test.each([401, 403])('a %s response asks the user to sign in', (status) => {
    showError(routeErrorResponse(status, ''));

    expect(heading()).toBe("You don't have access to this page.");
    expect(screen.getByText(/contact your administrator/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Sign In' }).getAttribute('href')).toBe('/c/login');
    expect(screen.queryByRole('button', { name: 'Go to Home' })).toBeNull();
    // Access errors are expected: they are not reported.
    expect(logCriticalError).not.toHaveBeenCalled();
  });

  test('an auth ErrorInfo is an access error showing its message', () => {
    showError({ isAuth: true, msg: 'Session ended' });

    expect(heading()).toBe("You don't have access to this page.");
    expect(screen.getByText('Session ended')).toBeTruthy();
  });

  test('another response shows its status text, then its data', () => {
    const view = showError(routeErrorResponse(500, 'Server exploded', 'ignored'));
    expect(heading()).toBe("Hmm, that didn't work.");
    expect(screen.getByText('Server exploded')).toBeTruthy();
    view.unmount();

    showError(routeErrorResponse(502, '', 'Bad gateway body'));
    expect(screen.getByText('Bad gateway body')).toBeTruthy();
  });

  test('a thrown Error shows its message and is reported with its stack', () => {
    const error = new Error('Cannot read properties of undefined');
    showError(error);

    expect(heading()).toBe("Hmm, that didn't work.");
    expect(screen.getByText('Cannot read properties of undefined')).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith(
      'Handling ErrorPage redirect error',
      expect.stringContaining('"message":"Cannot read properties of undefined"'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go to Home' }));
    expect(routerState.navigate).toHaveBeenCalledWith('/c/maps/');
  });

  test('an error coming from reCAPTCHA is tagged as such', () => {
    const error = new Error('script failed');
    error.stack = 'Error: script failed\n    at https://www.gstatic.com/recaptcha/releases/x.js';
    showError(error);

    expect(logCriticalError).toHaveBeenCalledWith(
      'Handling ErrorPage redirect error (reCAPTCHA origin)',
      expect.any(String),
    );
  });

  test('a thrown value without a message falls back to the generic text', () => {
    showError({ code: 42 });

    expect(screen.getByText(/Please try again later or contact support/)).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith(
      'Handling ErrorPage redirect error',
      '{"code":42}',
    );
  });

  test('a value that can not be serialised is reported as text', () => {
    const cyclic: { self?: unknown; message: string } = { message: '  ' };
    cyclic.self = cyclic;
    showError(cyclic);

    expect(screen.getByText(/Please try again later or contact support/)).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith(
      'Handling ErrorPage redirect error',
      '[object Object]',
    );
  });

  test('reports DOM insertBefore errors that escape React, and only those', () => {
    // A listener of the test's own, so that Jest does not take the dispatched errors as uncaught.
    const swallow = (event: Event): void => event.preventDefault();
    window.addEventListener('error', swallow);
    const view = showError(undefined);
    jest.mocked(logCriticalError).mockClear();

    const domError = Object.assign(new Error("Failed to execute 'insertBefore' on 'Node'"), {
      name: 'NotFoundError',
    });
    window.dispatchEvent(new ErrorEvent('error', { error: domError }));
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('other') }));
    expect(logCriticalError).toHaveBeenCalledTimes(1);
    expect(jest.mocked(logCriticalError).mock.calls[0][0]).toBe(
      'ErrorPage - Unhandled DOM manipulation error (insertBefore)',
    );

    const rejection = new Event('unhandledrejection') as Event & { reason?: unknown };
    rejection.reason = domError;
    window.dispatchEvent(rejection);
    const otherRejection = new Event('unhandledrejection') as Event & { reason?: unknown };
    otherRejection.reason = 'nope';
    window.dispatchEvent(otherRejection);
    expect(logCriticalError).toHaveBeenCalledTimes(2);
    expect(jest.mocked(logCriticalError).mock.calls[1][0]).toBe(
      'ErrorPage - Unhandled promise rejection with DOM manipulation error (insertBefore)',
    );

    // Once the page is gone the listeners are removed.
    view.unmount();
    window.dispatchEvent(new ErrorEvent('error', { error: domError }));
    expect(logCriticalError).toHaveBeenCalledTimes(2);
    window.removeEventListener('error', swallow);
  });
});
