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
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import ShareDialog from '../../../src/components/maps-page/action-dispatcher/share-dialog';
import Client, { Permission } from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';
import { BURST_TEXT, typeInBurst } from '../burst-typing';

const permissions: Permission[] = [
  { email: 'ana@wisemapping.com', name: 'Ana Ruiz', role: 'owner' },
  { email: 'diego@wisemapping.com', name: 'Diego Martin', role: 'editor' },
  { email: 'priya@wisemapping.com', role: 'viewer' },
];

const mockFetchMapPermissions = jest.fn<Promise<Permission[]>, [number]>();
const mockAddMapPermissions = jest.fn<Promise<void>, [number, string, Permission[]]>();
const mockDeleteMapPermission = jest.fn<Promise<void>, [number, string]>();

const client = {
  fetchMapPermissions: mockFetchMapPermissions,
  addMapPermissions: mockAddMapPermissions,
  deleteMapPermission: mockDeleteMapPermission,
} as unknown as Client;

const renderDialog = (onClose = jest.fn()) => {
  renderWithProviders(<ShareDialog mapId={101} onClose={onClose} />, { client });
  return onClose;
};

const emailsInput = (): HTMLInputElement =>
  screen.getByRole('textbox', { name: /Emails/ }) as HTMLInputElement;

const shareButton = (): HTMLElement => screen.getByRole('button', { name: 'Share' });

describe('ShareDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchMapPermissions.mockResolvedValue(permissions);
    mockAddMapPermissions.mockResolvedValue(undefined);
    mockDeleteMapPermission.mockResolvedValue(undefined);
  });

  test('lists the existing collaborators, falling back to the bare email when there is no name', async () => {
    renderDialog();

    const people = await screen.findByRole('list', { name: 'People with access' });
    expect(within(people).getByText('Ana Ruiz')).toBeDefined();
    expect(within(people).getByText('ana@wisemapping.com')).toBeDefined();
    expect(within(people).getByText('Diego Martin')).toBeDefined();
    expect(within(people).getByText('priya@wisemapping.com')).toBeDefined();
    expect(within(people).getByText('Owner')).toBeDefined();
    expect(mockFetchMapPermissions).toHaveBeenCalledWith(101);
  });

  test('keeps Share disabled until the typed address looks like an email', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.change(emailsInput(), { target: { value: 'not-an-email' } });
    expect((shareButton() as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(emailsInput(), { target: { value: 'sam@wisemapping.com' } });
    expect((shareButton() as HTMLButtonElement).disabled).toBe(false);
  });

  test('shares with the editor role by default', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.change(emailsInput(), { target: { value: 'sam@wisemapping.com' } });
    fireEvent.click(shareButton());

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, '', [
        { email: 'sam@wisemapping.com', role: 'editor' },
      ]),
    );
  });

  test('unchecking "Can edit" downgrades the invite to viewer', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Can edit' }));
    fireEvent.change(emailsInput(), { target: { value: 'sam@wisemapping.com' } });
    fireEvent.click(shareButton());

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, '', [
        { email: 'sam@wisemapping.com', role: 'viewer' },
      ]),
    );
  });

  test('splits a comma or semicolon separated list into one permission each', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.change(emailsInput(), {
      target: { value: 'sam@wisemapping.com, lee@wisemapping.com; mo@wisemapping.com' },
    });
    fireEvent.click(shareButton());

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, '', [
        { email: 'sam@wisemapping.com', role: 'editor' },
        { email: 'lee@wisemapping.com', role: 'editor' },
        { email: 'mo@wisemapping.com', role: 'editor' },
      ]),
    );
  });

  test('sends the custom message once it has been enabled', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Customize share message' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), {
      target: { value: 'Have a look at this.' },
    });
    fireEvent.change(emailsInput(), { target: { value: 'sam@wisemapping.com' } });
    fireEvent.click(shareButton());

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, 'Have a look at this.', [
        { email: 'sam@wisemapping.com', role: 'editor' },
      ]),
    );
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    renderDialog();
    await screen.findByText('Ana Ruiz');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Customize share message' }));
    const message = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;

    expect(
      await typeInBurst(emailsInput(), `sam@wisemapping.com, ${BURST_TEXT}@example.org`),
    ).toEqual([]);
    expect(await typeInBurst(message)).toEqual([]);
    fireEvent.click(shareButton());

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, BURST_TEXT, [
        { email: 'sam@wisemapping.com', role: 'editor' },
        { email: `${BURST_TEXT}@example.org`, role: 'editor' },
      ]),
    );
    // Two bursts, about 440 keys: under 2 s alone, but over the 5 s default in a loaded full run.
  }, 20000);

  test('removing a collaborator calls deleteMapPermission with their email', async () => {
    renderDialog();

    const row = (await screen.findByText('Diego Martin')).closest('li') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'Delete collaborator' }));

    await waitFor(() =>
      expect(mockDeleteMapPermission).toHaveBeenCalledWith(101, 'diego@wisemapping.com'),
    );
  });

  test('the owner cannot be removed', async () => {
    renderDialog();

    const row = (await screen.findByText('Ana Ruiz')).closest('li') as HTMLElement;

    const remove = within(row).getByRole('button', { name: 'Delete collaborator' });
    expect((remove as HTMLButtonElement).disabled).toBe(true);
  });

  test('surfaces a server error raised while sharing', async () => {
    mockAddMapPermissions.mockRejectedValue({ msg: 'You cannot share this map' });
    renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.change(emailsInput(), { target: { value: 'sam@wisemapping.com' } });
    fireEvent.click(shareButton());

    expect(await screen.findByText('You cannot share this map')).toBeDefined();
  });

  test('Close invokes onClose', async () => {
    const onClose = renderDialog();
    await screen.findByText('Ana Ruiz');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
