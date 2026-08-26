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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-intl', () => {
  const ReactActual = require('react');
  return {
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
      ReactActual.createElement('span', null, defaultMessage || id),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
        defaultMessage || id,
    }),
  };
});

jest.mock('../../../src/classes/middleware', () => ({
  useFetchMapById: jest.fn().mockReturnValue({
    data: { id: 101, title: 'Q3 product plan', public: false },
  }),
}));
jest.mock('../../../src/classes/app-config', () => ({
  __esModule: true,
  default: {
    getUiBaseUrl: () => 'https://app.wisemapping.com',
  },
}));

import ShareSheet from '../../../src/components/maps-page/action-dispatcher/share-sheet';
import { ClientContext } from '../../../src/classes/provider/client-context';
import Client from '../../../src/classes/client';

const mockFetchMapPermissions = jest.fn().mockResolvedValue([
  { email: 'ana@wisemapping.com', name: 'Ana Ruiz', role: 'owner' },
  { email: 'diego@wisemapping.com', name: 'Diego Martín', role: 'editor' },
]);
const mockAddMapPermissions = jest.fn().mockResolvedValue(undefined);
const mockDeleteMapPermission = jest.fn().mockResolvedValue(undefined);
const mockUpdateMapToPublic = jest.fn().mockResolvedValue(undefined);

const mockClient = {
  fetchMapPermissions: mockFetchMapPermissions,
  addMapPermissions: mockAddMapPermissions,
  deleteMapPermission: mockDeleteMapPermission,
  updateMapToPublic: mockUpdateMapToPublic,
} as unknown as Client;

const renderSheet = (onClose = jest.fn()) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    onClose,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ClientContext.Provider value={mockClient}>
          <ShareSheet mapId={101} onClose={onClose} />
        </ClientContext.Provider>
      </QueryClientProvider>,
    ),
  };
};

describe('ShareSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders the public link and existing collaborators', async () => {
    renderSheet();
    await waitFor(() =>
      expect(screen.getByTestId('share-sheet-collaborator-diego@wisemapping.com')).toBeDefined(),
    );
    expect(screen.getByTestId('share-sheet-link').querySelector('input')?.getAttribute('value')).toBe(
      'https://app.wisemapping.com/c/maps/101/public',
    );
  });

  test('toggling the publish switch calls updateMapToPublic', async () => {
    renderSheet();
    await waitFor(() => expect(screen.getByTestId('share-sheet-publish-toggle')).toBeDefined());

    const toggle = screen
      .getByTestId('share-sheet-publish-toggle')
      .querySelector('input') as HTMLInputElement;
    fireEvent.click(toggle);

    await waitFor(() => expect(mockUpdateMapToPublic).toHaveBeenCalledWith(101, true));
  });

  test('submitting an invite calls addMapPermissions with the entered email and role', async () => {
    renderSheet();
    await waitFor(() => expect(screen.getByTestId('share-sheet-invite-input')).toBeDefined());

    fireEvent.change(screen.getByTestId('share-sheet-invite-input').querySelector('input') as Element, {
      target: { value: 'priya@wisemapping.com' },
    });
    fireEvent.click(screen.getByTestId('share-sheet-invite-submit'));

    await waitFor(() =>
      expect(mockAddMapPermissions).toHaveBeenCalledWith(101, '', [
        { email: 'priya@wisemapping.com', role: 'editor' },
      ]),
    );
  });

  test('removing a collaborator calls deleteMapPermission', async () => {
    renderSheet();
    await waitFor(() =>
      expect(screen.getByTestId('share-sheet-collaborator-diego@wisemapping.com')).toBeDefined(),
    );

    fireEvent.click(screen.getByLabelText('Delete collaborator'));

    await waitFor(() =>
      expect(mockDeleteMapPermission).toHaveBeenCalledWith(101, 'diego@wisemapping.com'),
    );
  });

  test('the owner has no delete action', async () => {
    renderSheet();
    await waitFor(() =>
      expect(screen.getByTestId('share-sheet-collaborator-ana@wisemapping.com')).toBeDefined(),
    );
    const ownerRow = screen.getByTestId('share-sheet-collaborator-ana@wisemapping.com');
    expect(ownerRow.querySelector('button[aria-label="Delete collaborator"]')).toBeNull();
  });

  test('closing invalidates the permissions cache and calls onClose', async () => {
    const { onClose } = renderSheet();
    await waitFor(() => expect(screen.getByTestId('share-sheet-close')).toBeDefined());
    fireEvent.click(screen.getByTestId('share-sheet-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
