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
jest.mock('../../../../src/utils/analytics', () => ({
  trackPageView: jest.fn(),
  setAnalyticsUserEmail: jest.fn(),
}));
jest.mock('../../../../src/utils/redirect', () => ({
  ...jest.requireActual('../../../../src/utils/redirect'),
  leaveTo: jest.fn(),
}));
jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  logCriticalError: jest.fn(),
}));

import OAuthCallbackPage from '../../../../src/components/oauth-callback';
import Client, { Oauth2CallbackResult } from '../../../../src/classes/client';
import JwtTokenConfig from '../../../../src/classes/jwt-token-config';
import { logCriticalError } from '../../../../src/utils';
import { setAnalyticsUserEmail } from '../../../../src/utils/analytics';
import { leaveTo } from '../../../../src/utils/redirect';
import { startOAuthFlow } from '../../../../src/utils/oauth-flow';
import { installMatchMedia, renderPage } from '../helpers';
import { resetRouter, routerState, setLocation } from '../router-mock';

type CallbackClient = {
  processGoogleCallback: jest.Mock<Promise<Oauth2CallbackResult>, [string]>;
  processFacebookCallback: jest.Mock<Promise<Oauth2CallbackResult>, [string]>;
  confirmAccountSync: jest.Mock<Promise<void>, [string, string | undefined, string]>;
};

const setup = (
  url: string,
  result?: Oauth2CallbackResult,
  overrides: Partial<CallbackClient> = {},
  // A sign-in started from this tab, as the login and registration pages do; false for a link
  // that arrives from elsewhere.
  startedHere: boolean | { redirect: string } = true,
): CallbackClient => {
  if (startedHere) {
    startOAuthFlow(
      'https://accounts.example.com/auth',
      typeof startedHere === 'object' ? startedHere.redirect : undefined,
    );
  }
  setLocation(url);
  const client: CallbackClient = {
    processGoogleCallback: jest.fn<Promise<Oauth2CallbackResult>, [string]>(() =>
      Promise.resolve(result!),
    ),
    processFacebookCallback: jest.fn<Promise<Oauth2CallbackResult>, [string]>(() =>
      Promise.resolve(result!),
    ),
    confirmAccountSync: jest.fn<Promise<void>, [string, string | undefined, string]>(() =>
      Promise.resolve(),
    ),
    ...overrides,
  };
  renderPage(<OAuthCallbackPage />, client as unknown as Client);
  return client;
};

/** A JWT as the backend issues it: the account email is the subject. */
const jwt = (sub: string): string =>
  `h.${btoa(JSON.stringify({ sub })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.s`;
const ANA = jwt('ana@wisemapping.com');
const MALLORY = jwt('mallory@example.com');

const pending: Oauth2CallbackResult = {
  email: 'ana@wisemapping.com',
  oauthSync: false,
  syncCode: 'sync-1',
};

describe('OAuthCallbackPage flows', () => {
  beforeEach(() => {
    resetRouter();
    installMatchMedia(true);
    localStorage.clear();
    sessionStorage.clear();
    jest.mocked(leaveTo).mockClear();
    jest.mocked(logCriticalError).mockClear();
    jest.mocked(setAnalyticsUserEmail).mockClear();
  });

  test('a cancelled sign-in goes back to login', () => {
    const client = setup('/c/registration-google?error=access_denied');

    expect(routerState.navigate).toHaveBeenCalledWith('/c/login');
    expect(client.processGoogleCallback).not.toHaveBeenCalled();
  });

  test('a user who denied Facebook goes back to login', () => {
    setup('/c/registration-facebook?error=other&error_reason=user_denied');
    expect(routerState.navigate).toHaveBeenCalledWith('/c/login');
  });

  test('shows the provider error description', () => {
    setup('/c/registration-google?error=invalid_scope&error_description=Scope%20not%20allowed');

    expect(screen.getByText('Scope not allowed')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to login' }).getAttribute('href')).toBe(
      '/c/login',
    );
  });

  test('a callback without code or token is an error', () => {
    setup('/c/registration-google?state=x');
    expect(screen.getByText('Missing OAuth code or token in callback: ?state=x')).toBeTruthy();
  });

  test('a synced token callback stores the token and applies the system theme', () => {
    const store = jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(`/c/registration-google?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=true`);

    expect(store).toHaveBeenCalledWith(ANA);
    expect(setAnalyticsUserEmail).toHaveBeenCalledWith('ana@wisemapping.com');
    expect(localStorage.getItem('themeMode')).toBe('dark');
    expect(screen.getByText('Please wait while we validate your identity')).toBeTruthy();
  });

  test('a token callback for an account not linked yet asks to link it', async () => {
    jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);
    const client = setup(
      `/c/registration-facebook?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=false&syncCode=code-9`,
    );

    expect(await screen.findByText('Confirm')).toBeTruthy();
    expect(screen.getByText(/link your Facebook account/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Sync account' }));

    await waitFor(() =>
      expect(client.confirmAccountSync).toHaveBeenCalledWith(
        'ana@wisemapping.com',
        'code-9',
        'facebook',
      ),
    );
    await waitFor(() => expect(localStorage.getItem('themeMode')).toBe('dark'));
  });

  test('a Google code is exchanged with the Google callback', async () => {
    const client = setup('/c/registration-google?code=g-code', {
      email: 'ana@wisemapping.com',
      oauthSync: true,
    });

    await waitFor(() => expect(client.processGoogleCallback).toHaveBeenCalledWith('g-code'));
    expect(client.processFacebookCallback).not.toHaveBeenCalled();
    await waitFor(() => expect(localStorage.getItem('themeMode')).toBe('dark'));
  });

  test('a Facebook code for an account to link offers to sync it', async () => {
    const client = setup('/c/registration-facebook?code=f-code&state=%2Fc%2Fmaps%2F4', pending);

    expect(await screen.findByRole('button', { name: 'Sync account' })).toBeTruthy();
    expect(client.processFacebookCallback).toHaveBeenCalledWith('f-code');
    expect(screen.getByRole('link', { name: 'Back to login' })).toBeTruthy();
  });

  test('a failed code exchange is shown and logged', async () => {
    setup('/c/registration-google?code=bad', undefined, {
      processGoogleCallback: jest.fn<Promise<Oauth2CallbackResult>, [string]>(() =>
        Promise.reject({ msg: 'Code expired', status: 400 }),
      ),
    });

    expect(await screen.findByText('Code expired')).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith('Unexpected error on google OAuth callback', {
      msg: 'Code expired',
      status: 400,
    });
  });

  test('a failed account sync is shown and logged with its context', async () => {
    const client = setup('/c/registration-google?code=g-code&state=wisemapping', pending);
    client.confirmAccountSync.mockRejectedValue({ msg: 'Sync refused', status: 409 });

    fireEvent.click(await screen.findByRole('button', { name: 'Sync account' }));

    expect(await screen.findByText('Sync refused')).toBeTruthy();
    expect(logCriticalError).toHaveBeenCalledWith(
      expect.stringContaining('Status: 409, Message: Sync refused'),
      expect.objectContaining({
        probableCause: undefined,
        context: expect.objectContaining({ provider: 'google', syncCode: 'sync-1' }),
      }),
    );
  });

  test('an expired session while the sync was pending is explained in the log', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const client = setup('/c/registration-google?code=g-code', {
      email: 'ana@wisemapping.com',
      oauthSync: false,
      syncCode: 'oauth_pending',
    });
    client.confirmAccountSync.mockRejectedValue({ status: 401 });

    fireEvent.click(await screen.findByRole('button', { name: 'Sync account' }));

    await waitFor(() => expect(logCriticalError).toHaveBeenCalled());
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Session expired'));
    expect(jest.mocked(logCriticalError).mock.calls[0][0]).toContain('Status: 401, Message: none');
    expect(jest.mocked(logCriticalError).mock.calls[0][1]).toMatchObject({
      context: { redirectTarget: '/c/maps/', path: '/c/registration-google' },
    });
  });
  test('a synced sign-in goes on to the map list through the login page', () => {
    jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(`/c/registration-google?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=true`);

    expect(leaveTo).toHaveBeenCalledWith('/c/login?redirect=%2Fc%2Fmaps%2F');
  });

  test('the page the sign-in was started for is where it ends', () => {
    jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(
      `/c/registration-google?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=true`,
      undefined,
      {},
      { redirect: '/c/maps/7/edit' },
    );

    expect(leaveTo).toHaveBeenCalledWith('/c/login?redirect=%2Fc%2Fmaps%2F7%2Fedit');
  });

  test.each([
    ['javascript:alert(document.cookie)'],
    ['https://evil.example/phish'],
    ['//evil.example/phish'],
  ])('a state of %s is not followed', async (state) => {
    const client = setup(`/c/registration-google?code=g-code&state=${encodeURIComponent(state)}`, {
      email: 'ana@wisemapping.com',
      oauthSync: true,
    });

    await waitFor(() => expect(client.processGoogleCallback).toHaveBeenCalledWith('g-code'));
    await waitFor(() => expect(leaveTo).toHaveBeenCalledWith('/c/login?redirect=%2Fc%2Fmaps%2F'));
  });

  test('the token, code and email are removed from the address bar', () => {
    jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(
      `/c/registration-facebook?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=false&syncCode=code-9&state=x`,
    );

    expect(window.location.pathname).toBe('/c/registration-facebook');
    expect(window.location.search).toBe('?state=x');
  });

  test('a token link that was not started in this tab asks before signing in', async () => {
    const store = jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(
      `/c/registration-google?jwtToken=${MALLORY}&email=mallory%40example.com&oauthSync=true`,
      undefined,
      {},
      false,
    );

    expect(screen.getByText('Continue signing in?')).toBeTruthy();
    expect(screen.getByText(/with Google as mallory@example.com/)).toBeTruthy();
    expect(store).not.toHaveBeenCalled();
    expect(setAnalyticsUserEmail).not.toHaveBeenCalled();
    expect(leaveTo).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Back to login' }).getAttribute('href')).toBe(
      '/c/login',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(store).toHaveBeenCalledWith(MALLORY);
    expect(leaveTo).toHaveBeenCalledWith('/c/login?redirect=%2Fc%2Fmaps%2F');
  });

  test('a code that was not started in this tab is exchanged only after confirming', async () => {
    const client = setup(
      '/c/registration-facebook?code=f-code',
      { email: 'ana@wisemapping.com', oauthSync: true },
      {},
      false,
    );

    expect(screen.getByText(/sign in to WiseMapping with Facebook\. Continue only/)).toBeTruthy();
    expect(client.processFacebookCallback).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(client.processFacebookCallback).toHaveBeenCalledWith('f-code'));
  });

  test('a started sign-in is good for one callback only', () => {
    const store = jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);
    setup(`/c/registration-google?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=true`);
    expect(store).toHaveBeenCalledTimes(1);

    setup(
      `/c/registration-google?jwtToken=${ANA}&email=ana%40wisemapping.com&oauthSync=true`,
      undefined,
      {},
      false,
    );

    expect(store).toHaveBeenCalledTimes(1);
  });
  test("the account shown is the token's, whatever the email parameter says", () => {
    // An attacker's token with the victim's own address in the link: the confirmation would
    // read "as <victim>" and the victim would continue into the attacker's account.
    const store = jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(
      `/c/registration-google?jwtToken=${MALLORY}&email=ana%40wisemapping.com&oauthSync=true`,
      undefined,
      {},
      false,
    );

    expect(screen.getByText('This sign-in link is not valid. Please sign in again.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
    expect(store).not.toHaveBeenCalled();
    expect(setAnalyticsUserEmail).not.toHaveBeenCalled();
  });

  test('a token that is not a JWT is refused', () => {
    const store = jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup('/c/registration-google?jwtToken=garbage&email=ana%40wisemapping.com&oauthSync=true');

    expect(screen.getByText('This sign-in link is not valid. Please sign in again.')).toBeTruthy();
    expect(store).not.toHaveBeenCalled();
  });

  test('the analytics email comes from the token', () => {
    jest.spyOn(JwtTokenConfig, 'storeToken').mockImplementation(() => undefined);

    setup(`/c/registration-google?jwtToken=${ANA}&oauthSync=true`);

    expect(setAnalyticsUserEmail).toHaveBeenCalledWith('ana@wisemapping.com');
  });
});
