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

import { ForgotPasswordPage } from '../../../../src/components/forgot-password-page';
import ResetPasswordPage from '../../../../src/components/reset-password-page';
import ActivationPage from '../../../../src/components/activation-page';
import Client from '../../../../src/classes/client';
import { trackPageView } from '../../../../src/utils/analytics';
import { initAppConfig, installMatchMedia, renderPage } from '../helpers';
import { resetRouter, routerState, setLocation } from '../router-mock';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';

beforeAll(async () => {
  await initAppConfig();
});

beforeEach(() => {
  resetRouter();
  installMatchMedia(false);
  jest.mocked(trackPageView).mockClear();
});

describe('ForgotPasswordPage', () => {
  const setup = (action: 'EMAIL_SENT' | 'OAUTH2_USER' = 'EMAIL_SENT') => {
    setLocation('/c/forgot-password');
    const client = {
      resetPassword: jest.fn<Promise<{ action: string }>, [string]>(() =>
        Promise.resolve({ action }),
      ),
    };
    renderPage(<ForgotPasswordPage />, client as unknown as Client);
    return client;
  };

  const request = (email: string): void => {
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: email } });
    fireEvent.click(screen.getByRole('button', { name: 'Send recovery link' }));
  };

  test('sends the recovery link and shows the confirmation page', async () => {
    const client = setup('EMAIL_SENT');
    expect(screen.getByText('Reset your password')).toBeTruthy();
    expect(document.title).toBe('Forgot Password | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/forgot-password', 'ForgotPassword:Init');

    request('ana@wisemapping.com');

    await waitFor(() => expect(client.resetPassword).toHaveBeenCalledWith('ana@wisemapping.com'));
    await waitFor(() =>
      expect(routerState.navigate).toHaveBeenCalledWith('/c/forgot-password-success'),
    );
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    const client = setup();
    const email = screen.getByLabelText(/^Email/) as HTMLInputElement;

    expect(await typeInBurst(email, `${BURST_TEXT}@wisemapping.com`)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Send recovery link' }));

    await waitFor(() => expect(client.resetPassword).toHaveBeenCalledWith(email.value));
  });

  test('tells OAuth users they have no password to reset', async () => {
    setup('OAUTH2_USER');

    request('ana@wisemapping.com');

    expect(
      await screen.findByText('You dont need password, please login using Facebook or Google.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to login' }).getAttribute('href')).toBe(
      '/c/login',
    );
    expect(routerState.navigate).not.toHaveBeenCalled();
  });

  test('shows the server error', async () => {
    const client = setup();
    client.resetPassword.mockRejectedValue({
      msg: 'Unknown account',
      fields: { email: 'No account with this email' },
    });

    request('nobody@wisemapping.com');

    expect(await screen.findByText('Unknown account')).toBeTruthy();
    expect(screen.getByText('No account with this email')).toBeTruthy();
  });
});

describe('ResetPasswordPage', () => {
  const setup = (url = '/c/reset-password?token=tok-123') => {
    setLocation(url);
    const client = {
      resetPasswordFromToken: jest.fn<Promise<void>, [string, string]>(() => Promise.resolve()),
    };
    renderPage(<ResetPasswordPage />, client as unknown as Client);
    return client;
  };

  const submit = (password: string, confirm: string): void => {
    fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: password } });
    fireEvent.change(screen.getByLabelText(/^Confirm new password/), {
      target: { value: confirm },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Set new password' }).closest('form')!);
  };

  test('without a token, asks for a new link', () => {
    setup('/c/reset-password');

    expect(screen.getByText('Invalid password reset link. Please request a new one.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Request new link' }).getAttribute('href')).toBe(
      '/c/forgot-password',
    );
    expect(screen.queryByRole('button', { name: 'Set new password' })).toBeNull();
  });

  test('sets the new password with the token and goes to login', async () => {
    const client = setup();
    expect(document.title).toBe('Reset Password | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/reset-password', 'ResetPassword');

    submit('new-password', 'new-password');

    await waitFor(() =>
      expect(client.resetPasswordFromToken).toHaveBeenCalledWith('tok-123', 'new-password'),
    );
    await waitFor(() => expect(routerState.navigate).toHaveBeenCalledWith('/c/login'));
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    const client = setup();
    const password = screen.getByLabelText(/^New password/) as HTMLInputElement;
    const confirm = screen.getByLabelText(/^Confirm new password/) as HTMLInputElement;

    expect(await typeInBurst(password)).toEqual([]);
    expect(await typeInBurst(confirm)).toEqual([]);
    fireEvent.submit(screen.getByRole('button', { name: 'Set new password' }).closest('form')!);

    // What was typed reached the form: it is refused for its length.
    expect(await screen.findByText('Password must be less than 40 characters.')).toBeTruthy();
    expect(password.value).toBe(BURST_TEXT);
    expect(client.resetPasswordFromToken).not.toHaveBeenCalled();
  });

  test.each([
    ['short', 'short', 'Password must be at least 8 characters.'],
    ['x'.repeat(41), 'x'.repeat(41), 'Password must be less than 40 characters.'],
    ['new-password', 'other-password', 'Passwords do not match.'],
  ])('refuses "%s" / "%s": %s', (password, confirm, message) => {
    const client = setup();

    submit(password, confirm);

    expect(screen.getByText(message)).toBeTruthy();
    expect(client.resetPasswordFromToken).not.toHaveBeenCalled();
  });

  test('a fixed password clears the previous validation message', async () => {
    const client = setup();
    submit('short', 'short');
    expect(screen.getByText('Password must be at least 8 characters.')).toBeTruthy();

    submit('new-password', 'new-password');

    expect(screen.queryByText('Password must be at least 8 characters.')).toBeNull();
    await waitFor(() => expect(client.resetPasswordFromToken).toHaveBeenCalled());
  });

  test('shows the server error for an expired token', async () => {
    const client = setup();
    client.resetPasswordFromToken.mockRejectedValue({ msg: 'The link has expired' });

    submit('new-password', 'new-password');

    expect(await screen.findByText('The link has expired')).toBeTruthy();
    expect(routerState.navigate).not.toHaveBeenCalled();
  });
});

describe('ActivationPage', () => {
  const setup = (url: string, activate: () => Promise<void>) => {
    setLocation(url);
    const client = { activateAccount: jest.fn<Promise<void>, [string]>(activate) };
    renderPage(<ActivationPage />, client as unknown as Client);
    return client;
  };

  test('activates the account with the code from the link', async () => {
    const client = setup('/c/activation?code=abc', () => Promise.resolve());

    expect(screen.getByText('Activating Your Account')).toBeTruthy();
    expect(document.title).toBe('Account Activation | WiseMapping');
    expect(trackPageView).toHaveBeenCalledWith('/c/activation', 'Activation');

    expect(await screen.findByText('Account Activated Successfully')).toBeTruthy();
    expect(client.activateAccount).toHaveBeenCalledWith('abc');
    expect(screen.getByRole('link', { name: 'Sign In' }).getAttribute('href')).toBe('/c/login');
  });

  test('a link without a code is invalid', () => {
    const client = setup('/c/activation', () => Promise.resolve());

    expect(screen.getByText('Activation Failed')).toBeTruthy();
    expect(screen.getByText('Invalid activation link')).toBeTruthy();
    expect(client.activateAccount).not.toHaveBeenCalled();
  });

  test('shows the server reason when activation fails', async () => {
    setup('/c/activation?code=old', () => Promise.reject({ msg: 'Code already used' }));

    expect(await screen.findByText('Code already used')).toBeTruthy();
    expect(screen.getByText('Activation Failed')).toBeTruthy();
  });

  test('falls back to a generic reason', async () => {
    setup('/c/activation?code=old', () => Promise.reject({}));

    expect(await screen.findByText('Activation failed')).toBeTruthy();
  });
});
