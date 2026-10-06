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
jest.mock('../../../../src/utils', () => ({
  ...jest.requireActual('../../../../src/utils'),
  logCriticalError: jest.fn(),
}));

// The reCAPTCHA widget loads Google's script: replace it with buttons that report what the
// widget would (a token, an error, an expiry) and record the provider it was given.
const mockRecaptcha = {
  reset: jest.fn(),
  isLoading: false,
  instance: {} as object | undefined,
  siteKeys: [] as string[],
};
jest.mock('@google-recaptcha/react', () => ({
  GoogleReCaptchaProvider: ({ siteKey, children }: { siteKey: string; children: unknown }) => {
    mockRecaptcha.siteKeys.push(siteKey);
    return children;
  },
  GoogleReCaptchaCheckbox: ({
    onChange,
    onError,
    onExpired,
  }: {
    onChange: (token: string) => void;
    onError: () => void;
    onExpired: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onChange('captcha-token')}>
        solve captcha
      </button>
      <button type="button" onClick={() => onError()}>
        captcha error
      </button>
      <button type="button" onClick={() => onExpired()}>
        captcha expired
      </button>
    </div>
  ),
  useGoogleReCaptcha: () => ({
    reset: mockRecaptcha.reset,
    isLoading: mockRecaptcha.isLoading,
    instance: mockRecaptcha.instance,
  }),
}));

import RegistrationPage from '../../../../src/components/registration-page';
import Client from '../../../../src/classes/client';
import { logCriticalError } from '../../../../src/utils';
import { trackPageView } from '../../../../src/utils/analytics';
import { initAppConfig, installMatchMedia, renderPage, useConfig } from '../helpers';
import { resetRouter, routerState, setLocation } from '../router-mock';

const setup = () => {
  setLocation('/c/registration');
  const client = {
    registerNewUser: jest.fn<Promise<void>, [unknown]>(() => Promise.resolve()),
  };
  renderPage(<RegistrationPage />, client as unknown as Client);
  return client;
};

const fill = (): void => {
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'sam@wisemapping.com' } });
  fireEvent.change(screen.getByLabelText(/^First Name/), { target: { value: 'Sam' } });
  fireEvent.change(screen.getByLabelText(/^Last Name/), { target: { value: 'Lee' } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'long-password' } });
};

const submit = (): void => {
  fireEvent.submit(screen.getByRole('form', { name: 'Registration form' }));
};

describe('RegistrationPage', () => {
  beforeAll(async () => {
    await initAppConfig();
  });

  beforeEach(() => {
    resetRouter();
    installMatchMedia(false);
    jest.mocked(logCriticalError).mockClear();
    jest.mocked(trackPageView).mockClear();
    mockRecaptcha.reset = jest.fn();
    mockRecaptcha.isLoading = false;
    mockRecaptcha.instance = {};
    mockRecaptcha.siteKeys = [];
  });

  test('registers the user with the form values and goes to the success page', async () => {
    const client = setup();
    expect(document.title).toBe('Registration | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/registration', 'Registration:Init');
    expect(screen.queryByText('solve captcha')).toBeNull();

    fill();
    submit();

    await waitFor(() =>
      expect(client.registerNewUser).toHaveBeenCalledWith({
        email: 'sam@wisemapping.com',
        firstname: 'Sam',
        lastname: 'Lee',
        password: 'long-password',
        recaptcha: '',
        acceptedTerms: true,
      }),
    );
    await waitFor(() =>
      expect(routerState.navigate).toHaveBeenCalledWith('/c/registration-success'),
    );
  });

  test('shows the server errors under a "Registration Failed" title', async () => {
    const client = setup();
    client.registerNewUser.mockRejectedValue({
      msg: 'Could not register',
      fields: { email: 'Email already registered' },
    });

    fill();
    submit();

    expect(await screen.findByText('Registration Failed')).toBeTruthy();
    expect(screen.getByText('Could not register')).toBeTruthy();
    expect(screen.getByText('Email already registered')).toBeTruthy();
    expect(routerState.navigate).not.toHaveBeenCalled();
  });

  test('sends the user to login when registration is closed', () => {
    useConfig({ registrationEnabled: false });
    setup();

    expect(routerState.navigate).toHaveBeenCalledWith('/c/login');
    expect(screen.queryByRole('form')).toBeNull();
  });

  test('links back to login for existing users', () => {
    setup();
    const links = screen.getAllByRole('link', { name: 'Already have an account?' });
    expect(links.map((link) => link.getAttribute('href'))).toContain('/c/login');
  });

  test('offers sign-up with the enabled OAuth providers', () => {
    useConfig({
      googleOauth2Enabled: true,
      googleOauth2Url: 'https://accounts.example.com/auth',
      facebookOauth2Enabled: true,
      facebookOauth2Url: undefined,
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }));
    expect(consoleError).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Facebook' }));
    expect(consoleError).toHaveBeenCalledWith('Facebook OAuth callback URL is null');
  });

  describe('with reCAPTCHA', () => {
    beforeEach(() => {
      useConfig({ recaptcha2Enabled: true, recaptcha2SiteKey: 'site-key' });
    });

    test('sends the captcha token with the registration', async () => {
      const client = setup();
      expect(mockRecaptcha.siteKeys).toContain('site-key');

      fill();
      fireEvent.click(screen.getByText('solve captcha'));
      submit();

      await waitFor(() => expect(client.registerNewUser).toHaveBeenCalled());
      expect(client.registerNewUser.mock.calls[0][0]).toMatchObject({ recaptcha: 'captcha-token' });
    });

    test('an expired token is dropped and logged', async () => {
      const client = setup();

      fill();
      fireEvent.click(screen.getByText('solve captcha'));
      fireEvent.click(screen.getByText('captcha expired'));
      submit();

      await waitFor(() => expect(client.registerNewUser).toHaveBeenCalled());
      expect(client.registerNewUser.mock.calls[0][0]).toMatchObject({ recaptcha: '' });
      expect(logCriticalError).toHaveBeenCalledWith('reCAPTCHA token expired', expect.any(String));
    });

    test('a widget error is logged', () => {
      setup();
      fireEvent.click(screen.getByText('captcha error'));
      expect(logCriticalError).toHaveBeenCalledWith(
        'reCAPTCHA widget reported an error',
        expect.stringContaining('"siteKeyConfigured":true'),
      );
    });

    test('a failed registration resets the captcha for another try', async () => {
      const client = setup();
      client.registerNewUser.mockRejectedValue({ msg: 'Invalid captcha' });

      fill();
      submit();

      expect(await screen.findByText('Invalid captcha')).toBeTruthy();
      expect(mockRecaptcha.reset).toHaveBeenCalledTimes(1);
    });

    test('a captcha that is not ready is not reset, only logged', async () => {
      mockRecaptcha.instance = undefined;
      const client = setup();
      client.registerNewUser.mockRejectedValue({ msg: 'Invalid captcha' });

      fill();
      submit();

      await screen.findByText('Invalid captcha');
      expect(mockRecaptcha.reset).not.toHaveBeenCalled();
      expect(logCriticalError).toHaveBeenCalledWith(
        'reCAPTCHA reset skipped: widget not ready',
        expect.stringContaining('"hasInstance":false'),
      );
    });

    test('a reset that throws is logged', async () => {
      mockRecaptcha.reset = jest.fn(() => {
        throw new Error('widget gone');
      });
      const client = setup();
      client.registerNewUser.mockRejectedValue({ msg: 'Invalid captcha' });

      fill();
      submit();

      await screen.findByText('Invalid captcha');
      expect(logCriticalError).toHaveBeenCalledWith('reCAPTCHA reset() threw', expect.any(Error));
    });

    test('without a site key the form is shown without the widget, and that is logged', () => {
      useConfig({ recaptcha2SiteKey: undefined });
      setup();

      expect(screen.getByRole('form', { name: 'Registration form' })).toBeTruthy();
      expect(mockRecaptcha.siteKeys).toEqual([]);
      expect(logCriticalError).toHaveBeenCalledWith(
        'reCAPTCHA enabled but siteKey is missing — provider will not render',
        expect.any(String),
      );
    });
  });
});
