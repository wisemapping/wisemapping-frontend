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
import AccountInfoDialog from '../../../src/components/maps-page/account-menu/account-info-dialog';
import Client from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';

// The phrase the dialog tells the user to type.
const CHALLENGE = 'DELETE MY ACCOUNT';

const renderDialog = () => {
  // Never settles: a successful delete navigates away, which jsdom cannot do.
  const deleteAccount = jest.fn(() => new Promise<void>(() => undefined));
  const client = {
    fetchAccountInfo: () =>
      Promise.resolve({
        email: 'user@example.com',
        firstname: 'Jane',
        lastname: 'Doe',
        authenticationType: 'DATABASE',
        locale: 'en',
      }),
    deleteAccount,
  } as unknown as Client;
  renderWithProviders(<AccountInfoDialog onClose={jest.fn()} />, { client });
  return { deleteAccount };
};

const openDeleteConfirmation = async (): Promise<HTMLInputElement> => {
  fireEvent.click(await screen.findByRole('tab', { name: 'Account Settings' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Account' }));
  await screen.findByText('Are you absolutely sure?');
  return document.querySelector('input[name="deleteConfirmation"]') as HTMLInputElement;
};

const type = (input: HTMLInputElement, value: string): void => {
  fireEvent.change(input, { target: { value } });
};

// The dialog's own submit (its footer button, or Enter in the field).
const submitForm = (input: HTMLInputElement): void => {
  fireEvent.submit(input.closest('form')!);
};

// The red confirm button next to the field (the footer one is the form's submit).
const confirmButton = (): HTMLButtonElement =>
  screen
    .getAllByRole('button', { name: 'Delete Account' })
    .find((button) => button.getAttribute('type') !== 'submit') as HTMLButtonElement;

describe('AccountInfoDialog delete account', () => {
  test('submitting the form with only "DELETE" does not delete the account', async () => {
    const { deleteAccount } = renderDialog();
    const input = await openDeleteConfirmation();

    type(input, 'DELETE');
    submitForm(input);

    await screen.findByText(`Please type "${CHALLENGE}" to confirm account deletion.`);
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  test('submitting the form with the phrase shown deletes the account', async () => {
    const { deleteAccount } = renderDialog();
    const input = await openDeleteConfirmation();

    type(input, CHALLENGE);
    submitForm(input);

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
  });

  test('the confirm button asks for the same phrase as the form', async () => {
    const { deleteAccount } = renderDialog();
    const input = await openDeleteConfirmation();

    type(input, 'DELETE');
    expect(confirmButton().disabled).toBe(true);

    type(input, CHALLENGE);
    expect(confirmButton().disabled).toBe(false);
    fireEvent.click(confirmButton());

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
  });
});
