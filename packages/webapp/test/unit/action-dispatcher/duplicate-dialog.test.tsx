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

// `useFetchMapById` rebuilds its MapInfo object on every render, and the dialog
// keys an effect on that object, so the real hook re-renders forever once the
// query resolves. Stubbing it keeps this suite about the dialog itself.
const mockUseFetchMapById = jest.fn();
jest.mock('../../../src/classes/middleware', () => ({
  useFetchMapById: (id: number) => mockUseFetchMapById(id),
}));

import DuplicateDialog from '../../../src/components/maps-page/action-dispatcher/duplicate-dialog';
import Client, { MAP_TITLE_MAX_LENGTH, MapInfo } from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';
import { typeInBurst } from '../burst-typing';

const map: MapInfo = {
  id: 101,
  title: 'Original Mindmap',
  description: 'Original Description',
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: '2026-01-02T00:00:00Z',
  public: false,
  role: 'owner',
};

const mockDuplicateMap = jest.fn<Promise<number>, [number, unknown]>();

const client = { duplicateMap: mockDuplicateMap } as unknown as Client;

const renderDialog = (mapId = 101, onClose = jest.fn()) =>
  renderWithProviders(<DuplicateDialog mapId={mapId} onClose={onClose} />, { client });

const submitButton = (): HTMLElement => screen.getByRole('button', { name: 'Duplicate' });

describe('DuplicateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetchMapById.mockReturnValue({ isLoading: false, error: null, data: map });
    mockDuplicateMap.mockResolvedValue(202);
  });

  test('prefills the form with a "Copy of" title and the original description', async () => {
    renderDialog();

    expect(await screen.findByDisplayValue('Copy of Original Mindmap')).toBeDefined();
    expect(screen.getByDisplayValue('Original Description')).toBeDefined();
  });

  test('the title takes as many characters as the backend stores', async () => {
    renderDialog();

    const title = (await screen.findByDisplayValue('Copy of Original Mindmap')) as HTMLInputElement;
    expect(title.maxLength).toBe(MAP_TITLE_MAX_LENGTH);
  });

  test('submits the edited title and description to duplicateMap', async () => {
    renderDialog(101);

    const title = await screen.findByDisplayValue('Copy of Original Mindmap');
    fireEvent.change(title, { target: { value: 'New Copy Map' } });
    fireEvent.change(screen.getByDisplayValue('Original Description'), {
      target: { value: 'New Copy Description' },
    });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(mockDuplicateMap).toHaveBeenCalledWith(101, {
        title: 'New Copy Map',
        description: 'New Copy Description',
      }),
    );
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    renderDialog(101);
    const title = (await screen.findByDisplayValue('Copy of Original Mindmap')) as HTMLInputElement;
    const description = screen.getByDisplayValue('Original Description') as HTMLInputElement;
    fireEvent.change(title, { target: { value: '' } });

    expect(await typeInBurst(title)).toEqual([]);
    expect(await typeInBurst(description)).toEqual([]);
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(mockDuplicateMap).toHaveBeenCalledWith(101, {
        title: title.value,
        description: description.value,
      }),
    );
  });

  test('trims the submitted title', async () => {
    renderDialog(101);

    const title = await screen.findByDisplayValue('Copy of Original Mindmap');
    fireEvent.change(title, { target: { value: '  Padded Title  ' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(mockDuplicateMap).toHaveBeenCalledWith(101, {
        title: 'Padded Title',
        description: 'Original Description',
      }),
    );
  });

  test('refuses to submit a blank title', async () => {
    renderDialog(101);

    const title = (await screen.findByDisplayValue('Copy of Original Mindmap')) as HTMLInputElement;
    fireEvent.change(title, { target: { value: '   ' } });
    expect(title.value).toBe('   ');

    fireEvent.click(submitButton());

    await waitFor(() => expect(title.value).toBe('   '));
    expect(mockDuplicateMap).not.toHaveBeenCalled();
    // The field-level message has to reach the user: `ErrorInfo.fields` used to
    // be declared as a Map while `form/input` indexed it by key, so this text
    // was set and silently discarded.
    expect(await screen.findByText('Title is required')).toBeTruthy();
  });

  test('surfaces a server error instead of closing the dialog', async () => {
    mockDuplicateMap.mockRejectedValue({ msg: 'Map could not be duplicated' });
    const onClose = jest.fn();
    renderDialog(101, onClose);

    await screen.findByDisplayValue('Copy of Original Mindmap');
    fireEvent.click(submitButton());

    expect(await screen.findByText('Map could not be duplicated')).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('reports an invalid map id without calling the client', async () => {
    mockUseFetchMapById.mockReturnValue({ isLoading: false, error: null, data: undefined });

    renderDialog(Number.NaN);

    expect(await screen.findByText('Invalid map ID')).toBeDefined();
    expect(mockDuplicateMap).not.toHaveBeenCalled();
  });

  test('Cancel closes the dialog without duplicating', async () => {
    const onClose = jest.fn();
    renderDialog(101, onClose);

    await screen.findByDisplayValue('Copy of Original Mindmap');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(mockDuplicateMap).not.toHaveBeenCalled();
  });
});
