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
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import AccountManagement from '../../../../src/components/admin-console/accounts-page';
import AppConfig from '../../../../src/classes/app-config';
import { AuthenticationType } from '../../../../src/classes/client';
import type { AdminClientInterface } from '../../../../src/classes/client/admin-client';
import { renderWithWrapper } from '../providers';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';
import { buildAdminClient, makeAdminMap, makeUser, MockAdminClient, page } from './fixtures';

const dbUser = makeUser({
  id: 1,
  email: 'db@example.com',
  fullName: 'Dee Bee',
  allowSendEmail: true,
});
const pendingUser = makeUser({ id: 2, email: 'pending@example.com', isActive: false });
const suspendedUser = makeUser({
  id: 3,
  email: 'banned@example.com',
  isSuspended: true,
  suspensionReason: 'ABUSE',
});
const googleUser = makeUser({
  id: 4,
  email: 'google@example.com',
  authenticationType: AuthenticationType.GOOGLE_OAUTH2,
});
const facebookUser = makeUser({
  id: 5,
  email: 'fb@example.com',
  fullName: 'Eff Bee',
  authenticationType: AuthenticationType.FACEBOOK_OAUTH2,
});
const ldapUser = makeUser({
  id: 6,
  email: 'ldap@example.com',
  authenticationType: AuthenticationType.LDAP,
});

const allUsers = [dbUser, pendingUser, suspendedUser, googleUser, facebookUser, ldapUser];

let client: MockAdminClient;

const setup = ({ facebook = false, users = allUsers, totalPages = 1 } = {}) => {
  client.getAdminUsers.mockResolvedValue(page(users, totalPages));
  jest.spyOn(AppConfig, 'isFacebookOauth2Enabled').mockReturnValue(facebook);
  return renderWithWrapper(<AccountManagement />);
};

const lastParams = () => client.getAdminUsers.mock.calls.at(-1)?.[0];

const rowOf = (email: string): HTMLElement =>
  screen.getByText(new RegExp(`<${email}>`)).closest('tr') as HTMLElement;

const waitForRows = () => screen.findByText(/<db@example\.com>/);

const chooseOption = async (combobox: HTMLElement, option: string) => {
  fireEvent.mouseDown(combobox);
  const listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByRole('option', { name: option }));
};

const dialogClosed = () => waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

describe('AccountManagement', () => {
  beforeEach(() => {
    client = buildAdminClient();
    jest
      .spyOn(AppConfig, 'getAdminClient')
      .mockReturnValue(client as unknown as AdminClientInterface);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    // The page sends its queries without debug output.
    expect(console.log).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('lists the users of the first page, sorted by email', async () => {
    setup();
    await waitForRows();

    expect(lastParams()).toEqual({
      page: 0,
      pageSize: 50,
      search: undefined,
      sortBy: 'email',
      sortOrder: 'asc',
      filterActive: undefined,
      filterSuspended: undefined,
      filterAuthType: undefined,
    });
    expect(screen.getByText('User Management')).toBeTruthy();
    expect(within(rowOf('db@example.com')).getByText('Active')).toBeTruthy();
    expect(within(rowOf('pending@example.com')).getByText('Not Activated')).toBeTruthy();
    expect(within(rowOf('banned@example.com')).getByText('Suspended')).toBeTruthy();
    // One authentication icon per type.
    expect(within(rowOf('google@example.com')).getByLabelText('Google')).toBeTruthy();
    expect(within(rowOf('fb@example.com')).getByLabelText('Facebook')).toBeTruthy();
    expect(within(rowOf('ldap@example.com')).getByLabelText('LDAP')).toBeTruthy();
    expect(within(rowOf('db@example.com')).getByLabelText('Database')).toBeTruthy();
  });

  test('offers the actions that fit each account', async () => {
    setup();
    await waitForRows();

    const names = (email: string) =>
      within(rowOf(email))
        .getAllByRole('button')
        .map((b) => b.getAttribute('title'))
        .filter(Boolean);

    expect(names('db@example.com')).toEqual([
      'Edit user',
      'Suspend user',
      'Change password',
      'View user maps',
      'Delete user',
    ]);
    // Only a database account waiting for confirmation can be activated by hand.
    expect(names('pending@example.com')).toContain('Activate user');
    expect(names('banned@example.com')).toContain('Unsuspend user');
    expect(names('banned@example.com')).not.toContain('Suspend user');
    // The Facebook removal is only offered when Facebook login is enabled.
    expect(names('fb@example.com')).not.toContain('Remove Facebook Account');
  });

  test('says so when there are no users', async () => {
    setup({ users: [] });
    expect(await screen.findByText('No users found')).toBeTruthy();
  });

  test('shows the load error after the retry fails', async () => {
    jest.useFakeTimers();
    client.getAdminUsers.mockRejectedValue(new Error('Server unreachable'));
    jest.spyOn(AppConfig, 'isFacebookOauth2Enabled').mockReturnValue(false);
    renderWithWrapper(<AccountManagement />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getByText('Failed to load users: Server unreachable')).toBeTruthy();
    expect(client.getAdminUsers).toHaveBeenCalledTimes(2);
  });

  test('an error without a message reads "Unknown error"', async () => {
    jest.useFakeTimers();
    client.getAdminUsers.mockRejectedValue({});
    jest.spyOn(AppConfig, 'isFacebookOauth2Enabled').mockReturnValue(false);
    renderWithWrapper(<AccountManagement />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getByText('Failed to load users: Unknown error')).toBeTruthy();
  });

  test('the sortable headers change the requested order', async () => {
    setup();
    await waitForRows();

    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() =>
      expect(lastParams()).toMatchObject({ sortBy: 'firstname', sortOrder: 'asc' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() =>
      expect(lastParams()).toMatchObject({ sortBy: 'firstname', sortOrder: 'desc' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Created' }));
    await waitFor(() =>
      expect(lastParams()).toMatchObject({ sortBy: 'creationDate', sortOrder: 'asc' }),
    );
  });

  test('the filters are sent to the server', async () => {
    setup();
    await waitForRows();

    await chooseOption(screen.getByRole('combobox', { name: 'Auth Type' }), 'Google');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterAuthType: 'GOOGLE_OAUTH2' }));

    await waitForRows();
    await chooseOption(
      screen.getByRole('combobox', { name: 'Suspension Status' }),
      'Suspended Only',
    );
    await waitFor(() => expect(lastParams()).toMatchObject({ filterSuspended: true }));

    await waitForRows();
    await chooseOption(
      screen.getByRole('combobox', { name: 'Suspension Status' }),
      'Not Suspended',
    );
    await waitFor(() => expect(lastParams()).toMatchObject({ filterSuspended: false }));
  });

  test('the search is sent once the user stops typing', async () => {
    setup();
    await waitForRows();
    jest.useFakeTimers();

    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'ada' } });
    expect(lastParams()?.search).toBeUndefined();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
    });
    expect(lastParams()?.search).toBe('ada');
  });

  test('the search box takes 200 characters typed in one burst, as Cypress types them', async () => {
    setup();
    await waitForRows();
    const search = screen.getByPlaceholderText('Search users...') as HTMLInputElement;

    expect(await typeInBurst(search)).toEqual([]);

    await waitFor(() => expect(lastParams()?.search).toBe(BURST_TEXT), { timeout: 2000 });
  });

  test('the pagination requests the chosen page', async () => {
    setup({ totalPages: 3 });
    await waitForRows();

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    await waitFor(() => expect(lastParams()).toMatchObject({ page: 1 }));
  });

  test('"Refresh" reloads the list', async () => {
    setup();
    await waitForRows();
    const calls = client.getAdminUsers.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(client.getAdminUsers.mock.calls.length).toBe(calls + 1));
  });

  describe('editing', () => {
    test('the edit dialog is prefilled and saves the changes', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Edit user'));
      const dialog = await screen.findByRole('dialog', { name: 'Edit User' });
      expect((within(dialog).getByLabelText(/First Name/) as HTMLInputElement).value).toBe('First');
      expect((within(dialog).getByRole('switch') as HTMLInputElement).checked).toBe(true);

      fireEvent.change(within(dialog).getByLabelText(/Last Name/), {
        target: { value: 'Lovelace' },
      });
      fireEvent.click(within(dialog).getByRole('switch'));
      await chooseOption(within(dialog).getByRole('combobox'), 'Spanish');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update User' }));

      await waitFor(() =>
        expect(client.updateAdminUser).toHaveBeenCalledWith(1, {
          firstname: 'First',
          lastname: 'Lovelace',
          email: 'db@example.com',
          locale: 'es',
          allowSendEmail: false,
        }),
      );
      await dialogClosed();
    });

    test('the form refuses empty names and a malformed email', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Edit user'));
      const dialog = await screen.findByRole('dialog', { name: 'Edit User' });
      fireEvent.change(within(dialog).getByLabelText(/First Name/), { target: { value: ' ' } });
      fireEvent.change(within(dialog).getByLabelText(/Last Name/), { target: { value: '' } });
      fireEvent.change(within(dialog).getByLabelText(/^Email/), {
        target: { value: 'not-an-email' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update User' }));

      expect(within(dialog).getByText('First name is required')).toBeTruthy();
      expect(within(dialog).getByText('Last name is required')).toBeTruthy();
      expect(within(dialog).getByText('Invalid email format')).toBeTruthy();

      fireEvent.change(within(dialog).getByLabelText(/^Email/), { target: { value: '' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update User' }));
      expect(within(dialog).getByText('Email is required')).toBeTruthy();
      expect(client.updateAdminUser).not.toHaveBeenCalled();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test('its fields take 200 characters typed in one burst, as Cypress types them', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Edit user'));
      const dialog = await screen.findByRole('dialog', { name: 'Edit User' });
      const field = (label: RegExp) => within(dialog).getByLabelText(label) as HTMLInputElement;

      expect(await typeInBurst(field(/First Name/))).toEqual([]);
      expect(await typeInBurst(field(/Last Name/))).toEqual([]);
      fireEvent.change(field(/^Email/), { target: { value: '' } });
      expect(await typeInBurst(field(/^Email/))).toEqual([]);
      fireEvent.change(field(/^Email/), { target: { value: 'ada@example.com' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update User' }));

      await waitFor(() =>
        expect(client.updateAdminUser).toHaveBeenCalledWith(1, {
          firstname: `First${BURST_TEXT}`,
          lastname: `Last1${BURST_TEXT}`,
          email: 'ada@example.com',
          locale: 'en',
          allowSendEmail: true,
        }),
      );
    });

    test('creating after a cancelled edit creates a new user', async () => {
      jest.spyOn(window, 'prompt').mockReturnValue('s3cret!');
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Edit user'));
      let dialog = await screen.findByRole('dialog', { name: 'Edit User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();

      fireEvent.click(screen.getByRole('button', { name: 'Add New User' }));
      dialog = await screen.findByRole('dialog', { name: 'Create User' });
      // The form starts empty, not with the user that was being edited.
      expect((within(dialog).getByLabelText(/First Name/) as HTMLInputElement).value).toBe('');
      fireEvent.change(within(dialog).getByLabelText(/First Name/), { target: { value: 'Ada' } });
      fireEvent.change(within(dialog).getByLabelText(/Last Name/), { target: { value: 'Byron' } });
      fireEvent.change(within(dialog).getByLabelText(/^Email/), {
        target: { value: 'ada@example.com' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create User' }));

      await waitFor(() =>
        expect(client.createAdminUser).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'ada@example.com', password: 's3cret!' }),
        ),
      );
      expect(client.updateAdminUser).not.toHaveBeenCalled();
    });

    test('a failed update is reported in the dialog', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.updateAdminUser.mockRejectedValue(new Error('nope'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Edit user'));
      const dialog = await screen.findByRole('dialog', { name: 'Edit User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update User' }));

      expect(
        await within(dialog).findByText('Failed to update user. Please try again.'),
      ).toBeTruthy();
    });
  });

  describe('creating', () => {
    const openCreate = async () => {
      // The header button is named by its tooltip.
      fireEvent.click(screen.getByRole('button', { name: 'Add New User' }));
      const dialog = await screen.findByRole('dialog', { name: 'Create User' });
      fireEvent.change(within(dialog).getByLabelText(/First Name/), { target: { value: 'Ada' } });
      fireEvent.change(within(dialog).getByLabelText(/Last Name/), { target: { value: 'Byron' } });
      fireEvent.change(within(dialog).getByLabelText(/^Email/), {
        target: { value: 'ada@example.com' },
      });
      return dialog;
    };

    test('creates an active database user with the prompted password', async () => {
      jest.spyOn(window, 'prompt').mockReturnValue('s3cret!');
      setup();
      await waitForRows();

      const dialog = await openCreate();
      fireEvent.click(within(dialog).getByRole('switch'));
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create User' }));

      await waitFor(() =>
        expect(client.createAdminUser).toHaveBeenCalledWith(
          expect.objectContaining({
            firstname: 'Ada',
            lastname: 'Byron',
            email: 'ada@example.com',
            locale: 'en',
            allowSendEmail: true,
            password: 's3cret!',
            isActive: true,
            isSuspended: false,
            authenticationType: AuthenticationType.DATABASE,
          }),
        ),
      );
      await dialogClosed();
    });

    test('its fields take 200 characters typed in one burst, as Cypress types them', async () => {
      jest.spyOn(window, 'prompt').mockReturnValue('s3cret!');
      setup();
      await waitForRows();

      fireEvent.click(screen.getByRole('button', { name: 'Add New User' }));
      const dialog = await screen.findByRole('dialog', { name: 'Create User' });
      const field = (label: RegExp) => within(dialog).getByLabelText(label) as HTMLInputElement;

      expect(await typeInBurst(field(/First Name/))).toEqual([]);
      expect(await typeInBurst(field(/Last Name/))).toEqual([]);
      expect(await typeInBurst(field(/^Email/))).toEqual([]);
      fireEvent.change(field(/^Email/), { target: { value: 'ada@example.com' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create User' }));

      await waitFor(() =>
        expect(client.createAdminUser).toHaveBeenCalledWith(
          expect.objectContaining({
            firstname: BURST_TEXT,
            lastname: BURST_TEXT,
            email: 'ada@example.com',
            password: 's3cret!',
          }),
        ),
      );
    });

    test('cancelling the password prompt creates nothing', async () => {
      jest.spyOn(window, 'prompt').mockReturnValue(null);
      setup();
      await waitForRows();

      const dialog = await openCreate();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create User' }));

      expect(window.prompt).toHaveBeenCalledWith('Enter password for new user:');
      expect(client.createAdminUser).not.toHaveBeenCalled();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test('a failed creation is reported in the dialog', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(window, 'prompt').mockReturnValue('s3cret!');
      client.createAdminUser.mockRejectedValue(new Error('taken'));
      setup();
      await waitForRows();

      const dialog = await openCreate();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create User' }));

      expect(
        await within(dialog).findByText('Failed to create user. Please try again.'),
      ).toBeTruthy();
    });
  });

  describe('status changes', () => {
    test('suspending asks for a reason and sends it', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('db@example.com')).getByTitle('Suspend user'));
      const dialog = await screen.findByRole('dialog', { name: 'Suspend User' });
      expect(within(dialog).getByText(/suspend user "db@example.com"/)).toBeTruthy();

      await chooseOption(within(dialog).getByRole('combobox'), 'Abuse');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend User' }));

      await waitFor(() =>
        expect(client.updateUserSuspension).toHaveBeenCalledWith(1, {
          suspended: true,
          suspensionReason: 'ABUSE',
        }),
      );
      await dialogClosed();
    });

    test('suspending without a reason sends none; cancelling sends nothing', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.updateUserSuspension.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      // From the status chip menu.
      fireEvent.click(within(rowOf('db@example.com')).getByText('Active'));
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Suspend user' }));
      let dialog = await screen.findByRole('dialog', { name: 'Suspend User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend User' }));
      await waitFor(() =>
        expect(client.updateUserSuspension).toHaveBeenCalledWith(1, {
          suspended: true,
          suspensionReason: undefined,
        }),
      );
      // The failure leaves the dialog open.
      await waitFor(() => expect(console.error).toHaveBeenCalled());
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();

      fireEvent.click(within(rowOf('ldap@example.com')).getByTitle('Suspend user'));
      dialog = await screen.findByRole('dialog', { name: 'Suspend User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
      expect(client.updateUserSuspension).toHaveBeenCalledTimes(1);
    });

    test('unsuspending shows the current reason and lifts the suspension', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('banned@example.com')).getByTitle('Unsuspend user'));
      const dialog = await screen.findByRole('dialog', { name: 'Unsuspend User' });
      expect(within(dialog).getByText(/Current suspension reason:\s+Abuse/)).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Unsuspend User' }));
      await waitFor(() =>
        expect(client.updateUserSuspension).toHaveBeenCalledWith(3, { suspended: false }),
      );
      await dialogClosed();
    });

    test('unsuspending can be cancelled, and a failure is logged', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.updateUserSuspension.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('banned@example.com')).getByText('Suspended'));
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
      const dialog = await screen.findByRole('dialog', { name: 'Unsuspend User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Unsuspend User' }));
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith('Failed to unsuspend user:', expect.any(Error)),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test('activating a pending account', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('pending@example.com')).getByTitle('Activate user'));
      const dialog = await screen.findByRole('dialog', { name: 'Activate User' });
      expect(within(dialog).getByText(/activate user "pending@example.com"/)).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Activate User' }));
      await waitFor(() => expect(client.activateAdminUser).toHaveBeenCalledWith(2));
      await dialogClosed();
    });

    test('activation can be cancelled, and a failure is logged', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.activateAdminUser.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('pending@example.com')).getByText('Not Activated'));
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Activate user' }));
      const dialog = await screen.findByRole('dialog', { name: 'Activate User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Activate User' }));
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith('Failed to activate user:', expect.any(Error)),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test('deleting asks for confirmation', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('ldap@example.com')).getByTitle('Delete user'));
      const dialog = await screen.findByRole('dialog', { name: 'Delete User' });
      expect(within(dialog).getByText('This action cannot be undone!')).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete User' }));
      await waitFor(() => expect(client.deleteAdminUser).toHaveBeenCalledWith(6));
      await dialogClosed();
    });

    test('deleting can be cancelled, and a failure is logged', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.deleteAdminUser.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('ldap@example.com')).getByTitle('Delete user'));
      const dialog = await screen.findByRole('dialog', { name: 'Delete User' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete User' }));
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith('Failed to delete user:', expect.any(Error)),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });
  });

  describe('changing a password', () => {
    const openFor = async (email: string) => {
      fireEvent.click(within(rowOf(email)).getByTitle('Change password'));
      return screen.findByRole('dialog', { name: 'Change Password' });
    };

    test('validates the new password before sending it', async () => {
      setup();
      await waitForRows();

      const dialog = await openFor('db@example.com');
      expect(within(dialog).getByText('Change password for user: db@example.com')).toBeTruthy();

      const submit = within(dialog).getByRole('button', { name: 'Change Password' });
      fireEvent.click(submit);
      expect(within(dialog).getByText('Password must be at least 6 characters')).toBeTruthy();

      fireEvent.change(within(dialog).getByLabelText('New Password'), {
        target: { value: 'secret1' },
      });
      expect(within(dialog).queryByText('Password must be at least 6 characters')).toBeNull();
      fireEvent.change(within(dialog).getByLabelText('Confirm Password'), {
        target: { value: 'secret2' },
      });
      fireEvent.click(submit);
      expect(within(dialog).getByText('Passwords do not match')).toBeTruthy();

      fireEvent.change(within(dialog).getByLabelText('Confirm Password'), {
        target: { value: 'secret1' },
      });
      fireEvent.click(submit);

      await waitFor(() => expect(client.changeUserPassword).toHaveBeenCalledWith(1, 'secret1'));
      await dialogClosed();
    });

    test('its fields take 200 characters typed in one burst, as Cypress types them', async () => {
      setup();
      await waitForRows();

      const dialog = await openFor('db@example.com');
      const field = (label: string) => within(dialog).getByLabelText(label) as HTMLInputElement;

      expect(await typeInBurst(field('New Password'))).toEqual([]);
      expect(await typeInBurst(field('Confirm Password'))).toEqual([]);
      fireEvent.click(within(dialog).getByRole('button', { name: 'Change Password' }));

      await waitFor(() => expect(client.changeUserPassword).toHaveBeenCalledWith(1, BURST_TEXT));
      await dialogClosed();
    });

    test('reopening the dialog starts from empty fields', async () => {
      setup();
      await waitForRows();

      let dialog = await openFor('db@example.com');
      fireEvent.change(within(dialog).getByLabelText('New Password'), {
        target: { value: 'abc' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Change Password' }));
      expect(within(dialog).getByText('Password must be at least 6 characters')).toBeTruthy();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();

      dialog = await openFor('ldap@example.com');
      expect(within(dialog).getByText('Change password for user: ldap@example.com')).toBeTruthy();
      expect(within(dialog).queryByRole('alert')).toBeNull();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      await dialogClosed();

      dialog = await openFor('db@example.com');
      expect((within(dialog).getByLabelText('New Password') as HTMLInputElement).value).toBe('');
      expect(within(dialog).queryByRole('alert')).toBeNull();
    });

    test('a failed change is reported', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.changeUserPassword.mockRejectedValue(new Error('weak'));
      setup();
      await waitForRows();

      const dialog = await openFor('db@example.com');
      fireEvent.change(within(dialog).getByLabelText('New Password'), {
        target: { value: 'secret1' },
      });
      fireEvent.change(within(dialog).getByLabelText('Confirm Password'), {
        target: { value: 'secret1' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Change Password' }));

      expect(await within(dialog).findByText('Failed to change password')).toBeTruthy();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test.each([
      ['google@example.com', /authenticated via Google/],
      ['fb@example.com', /authenticated via Facebook/],
    ])('is not available for the OAuth account %s', async (email, message) => {
      setup();
      await waitForRows();

      const dialog = await openFor(email);
      expect(within(dialog).getByText(message)).toBeTruthy();
      expect(within(dialog).queryByLabelText('New Password')).toBeNull();
      expect(within(dialog).queryByRole('button', { name: 'Change Password' })).toBeNull();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      await dialogClosed();
    });
  });

  test('"View user maps" loads the maps, and suspending from there opens the suspend dialog', async () => {
    client.getUserMaps.mockResolvedValue([makeAdminMap({ id: 70, title: 'Owned map' })]);
    setup();
    await waitForRows();

    fireEvent.click(within(rowOf('db@example.com')).getByTitle('View user maps'));
    const dialog = await screen.findByRole('dialog', { name: /Maps owned by db@example.com/ });

    expect(await within(dialog).findByText('Owned map')).toBeTruthy();
    expect(client.getUserMaps).toHaveBeenCalledWith(1);

    fireEvent.click(within(dialog).getByText('Active'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Suspend user' }));

    expect(await screen.findByRole('dialog', { name: 'Suspend User' })).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Maps owned by/ })).toBeNull());
  });

  test('the maps dialog of a suspended user can lift the suspension, and closes', async () => {
    setup();
    await waitForRows();

    fireEvent.click(within(rowOf('banned@example.com')).getByTitle('View user maps'));
    let dialog = await screen.findByRole('dialog', { name: /Maps owned by banned@example.com/ });
    expect(await within(dialog).findByText('This user has no maps.')).toBeTruthy();

    fireEvent.click(within(dialog).getByText('Suspended'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
    expect(await screen.findByRole('dialog', { name: 'Unsuspend User' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await dialogClosed();

    fireEvent.click(within(rowOf('banned@example.com')).getByTitle('View user maps'));
    dialog = await screen.findByRole('dialog', { name: /Maps owned by/ });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await dialogClosed();
  });

  describe('Facebook data deletion', () => {
    const openLookup = async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Facebook data deletion lookup' }));
      return screen.findByLabelText('facebookId');
    };

    test('finds the account for a Facebook id and removes the association', async () => {
      client.getUserByFacebookId.mockResolvedValue(facebookUser);
      setup({ facebook: true });
      await waitForRows();

      const input = await openLookup();
      const find = screen.getByRole('button', { name: 'Find Account' }) as HTMLButtonElement;
      expect(find.disabled).toBe(true);

      fireEvent.change(input, { target: { value: ' 652098797767905 ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() =>
        expect(client.getUserByFacebookId).toHaveBeenCalledWith('652098797767905'),
      );
      const result = await screen.findByText('Eff Bee');
      fireEvent.click(
        within(result.closest('[role="alert"]') as HTMLElement).getByRole('button', {
          name: 'Remove',
        }),
      );

      const dialog = await screen.findByRole('dialog', { name: 'Remove Facebook Account' });
      expect(
        within(dialog).getByText('Remove Facebook association for "fb@example.com"?'),
      ).toBeTruthy();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Remove Facebook Account' }));

      await waitFor(() => expect(client.removeFacebookAccount).toHaveBeenCalledWith(5));
      await dialogClosed();
      // The lookup is reset.
      expect(screen.queryByText('Eff Bee')).toBeNull();
      expect((screen.getByLabelText('facebookId') as HTMLInputElement).value).toBe('');
    });

    test('the Facebook id field takes 200 characters typed in one burst, as Cypress types them', async () => {
      client.getUserByFacebookId.mockResolvedValue(facebookUser);
      setup({ facebook: true });
      await waitForRows();

      const input = (await openLookup()) as HTMLInputElement;
      expect(await typeInBurst(input)).toEqual([]);
      fireEvent.click(screen.getByRole('button', { name: 'Find Account' }));

      await waitFor(() => expect(client.getUserByFacebookId).toHaveBeenCalledWith(BURST_TEXT));
    });

    test('reports an unknown Facebook id', async () => {
      client.getUserByFacebookId.mockRejectedValue(new Error('404'));
      setup({ facebook: true });
      await waitForRows();

      const input = await openLookup();
      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Find Account' }));

      expect(await screen.findByText('No account found for this Facebook user ID.')).toBeTruthy();

      // Typing again clears the message; an empty id is not looked up.
      fireEvent.change(input, { target: { value: '   ' } });
      expect(screen.queryByText('No account found for this Facebook user ID.')).toBeNull();
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(client.getUserByFacebookId).toHaveBeenCalledTimes(1);
    });

    test('a Facebook account row offers the removal, which can be cancelled', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.removeFacebookAccount.mockRejectedValue(new Error('denied'));
      setup({ facebook: true });
      await waitForRows();

      fireEvent.click(within(rowOf('fb@example.com')).getByTitle('Remove Facebook Account'));
      const dialog = await screen.findByRole('dialog', { name: 'Remove Facebook Account' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Remove Facebook Account' }));
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith(
          'Failed to remove Facebook account:',
          expect.any(Error),
        ),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });
  });
});
