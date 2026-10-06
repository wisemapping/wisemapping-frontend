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
import AccountInfoDialog from '../../../../src/components/maps-page/account-menu/account-info-dialog';
import Client, { AccountInfo, AuthenticationType } from '../../../../src/classes/client';
import { Locales } from '../../../../src/classes/app-i18n';
import { renderWithProviders } from '../../helpers/render';

const CHALLENGE = 'DELETE MY ACCOUNT';

type AccountClient = {
  fetchAccountInfo: jest.Mock<Promise<AccountInfo>, []>;
  updateAccountInfo: jest.Mock<Promise<void>, [string, string]>;
  updateAccountPassword: jest.Mock<Promise<void>, [string]>;
  updateAccountLanguage: jest.Mock<Promise<void>, [string]>;
  deleteAccount: jest.Mock<Promise<void>, []>;
};

const setup = (extra: Partial<AccountInfo> = {}) => {
  const info = {
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane@wisemapping.com',
    authenticationType: AuthenticationType.DATABASE,
    isAdmin: false,
    locale: Locales.EN,
    ...extra,
  } as AccountInfo;
  const client: AccountClient = {
    fetchAccountInfo: jest.fn(() => Promise.resolve(info)),
    updateAccountInfo: jest.fn<Promise<void>, [string, string]>(() => Promise.resolve()),
    updateAccountPassword: jest.fn<Promise<void>, [string]>(() => Promise.resolve()),
    updateAccountLanguage: jest.fn<Promise<void>, [string]>(() => Promise.resolve()),
    deleteAccount: jest.fn(() => Promise.resolve()),
  };
  const onClose = jest.fn();
  renderWithProviders(<AccountInfoDialog onClose={onClose} />, {
    client: client as unknown as Client,
  });
  return { client, onClose };
};

beforeEach(() => {
  // The account is only fetched on private pages.
  window.history.pushState({}, '', '/c/maps');
  // MUI warns about the out-of-range language value of the bug recorded below: keep only that
  // warning out of the output.
  const warn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (!String(args[0]).includes('out-of-range value')) {
      warn(...args);
    }
  });
});

const tab = (name: string): Promise<HTMLElement> => screen.findByRole('tab', { name });

const field = (name: string): HTMLInputElement =>
  document.querySelector(`input[name="${name}"]`) as HTMLInputElement;

const type = (name: string, value: string): void => {
  fireEvent.change(field(name), { target: { value } });
};

const submit = (): void => {
  fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
};

describe('AccountInfoDialog personal info', () => {
  test('prefills the account and saves the edited name', async () => {
    const { client, onClose } = setup();
    await waitFor(() => expect(field('firstname').value).toBe('Jane'));
    expect(field('email').value).toBe('jane@wisemapping.com');
    expect(field('email').disabled).toBe(true);

    type('firstname', 'Janet');
    type('lastname', 'Smith');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(client.updateAccountInfo).toHaveBeenCalledWith('Janet', 'Smith'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('shows why the name could not be saved', async () => {
    const { client, onClose } = setup();
    client.updateAccountInfo.mockRejectedValue({ msg: 'Name too long' });
    await waitFor(() => expect(field('firstname').value).toBe('Jane'));

    submit();

    expect(await screen.findByText('Name too long')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('an OAuth account has no email field and no password tab', async () => {
    setup({ authenticationType: AuthenticationType.GOOGLE_OAUTH2 });
    await waitFor(() => expect(field('firstname').value).toBe('Jane'));

    expect(field('email')).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Change Password' })).toBeNull();
  });

  test('cancel closes the dialog', async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AccountInfoDialog password', () => {
  const openPasswordTab = async () => {
    const result = setup();
    fireEvent.click(await tab('Change Password'));
    await screen.findByText('Please, provide the new password for your account.');
    return result;
  };

  test.each([
    ['   ', '   ', 'Password cannot be empty.'],
    ['short', 'short', 'Password must be at least 8 characters long.'],
    ['x'.repeat(40), 'x'.repeat(40), 'Password cannot be longer than 39 characters.'],
    ['new-password', 'other-password', 'Password do not match. Please, try again.'],
  ])('refuses "%s" / "%s"', async (password, retry, message) => {
    const { client } = await openPasswordTab();

    type('password', password);
    type('retryPassword', retry);
    submit();

    expect(await screen.findByText(message)).toBeTruthy();
    expect(client.updateAccountPassword).not.toHaveBeenCalled();
  });

  test('changes the password and closes', async () => {
    const { client, onClose } = await openPasswordTab();

    type('password', 'new-password');
    type('retryPassword', 'new-password');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(client.updateAccountPassword).toHaveBeenCalledWith('new-password'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('shows why the password could not be changed', async () => {
    const { client } = await openPasswordTab();
    client.updateAccountPassword.mockRejectedValue({ msg: 'Password was used before' });

    type('password', 'new-password');
    type('retryPassword', 'new-password');
    submit();

    expect(await screen.findByText('Password was used before')).toBeTruthy();
  });
});

describe('AccountInfoDialog account settings', () => {
  const openSettingsTab = async (extra: Partial<AccountInfo> = {}) => {
    const result = setup(extra);
    fireEvent.click(await tab('Account Settings'));
    await screen.findByRole('button', { name: 'Delete Account' });
    return result;
  };

  test('the settings tab has nothing to submit until deletion is requested', async () => {
    await openSettingsTab();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(screen.getByText('All your mindmaps and their content')).toBeTruthy();
  });

  test('changing the language saves it to the account', async () => {
    const { client } = await openSettingsTab();

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Deutsch' }));

    await waitFor(() => expect(client.updateAccountLanguage).toHaveBeenCalledWith('de'));
  });

  test('shows why the language could not be changed', async () => {
    const { client } = await openSettingsTab();
    client.updateAccountLanguage.mockRejectedValue({ msg: 'Language not available' });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Italiano' }));

    expect(await screen.findByText('Language not available')).toBeTruthy();
  });

  // The account's locale is a Locale object; the effect that syncs the form used to store the
  // object itself as the selected LocaleCode, so the select matched no option and showed empty.
  test("the language select shows the account's language", async () => {
    await openSettingsTab({ locale: Locales.ES });

    await waitFor(() => expect(screen.getByRole('combobox').textContent).toBe('Español'));
  });

  test('asking to delete, then cancelling, goes back to the warning', async () => {
    const { client } = await openSettingsTab();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    expect(await screen.findByText('Are you absolutely sure?')).toBeTruthy();
    // The confirmation's own Cancel comes before the dialog's.
    const [cancelDeletion, cancelDialog] = screen.getAllByRole('button', { name: 'Cancel' });
    expect(cancelDialog.getAttribute('type')).toBe('button');
    fireEvent.click(cancelDeletion);

    expect(await screen.findByText('All your mindmaps and their content')).toBeTruthy();
    expect(client.deleteAccount).not.toHaveBeenCalled();
  });

  test('going back to the personal tab drops a pending deletion', async () => {
    await openSettingsTab();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    type('deleteConfirmation', CHALLENGE);

    fireEvent.click(await tab('Personal Info'));
    fireEvent.click(await tab('Account Settings'));

    expect(await screen.findByText('All your mindmaps and their content')).toBeTruthy();
    expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
  });

  test('typing the phrase clears the "type the phrase" error', async () => {
    await openSettingsTab();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    type('deleteConfirmation', 'DELETE');
    submit();
    const message = `Please type "${CHALLENGE}" to confirm account deletion.`;
    expect(await screen.findByText(message)).toBeTruthy();

    type('deleteConfirmation', 'DELETE MY');

    await waitFor(() => expect(screen.queryByText(message)).toBeNull());
  });

  test('shows why the account could not be deleted', async () => {
    const { client } = await openSettingsTab();
    client.deleteAccount.mockRejectedValue({ msg: 'Transfer your maps first' });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    type('deleteConfirmation', CHALLENGE);
    submit();

    expect(await screen.findByText('Transfer your maps first')).toBeTruthy();
  });
});
