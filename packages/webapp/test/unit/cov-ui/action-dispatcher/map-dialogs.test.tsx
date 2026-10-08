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

// `useFetchMapById` is stubbed, as in test/unit/action-dispatcher: these suites are about the
// dialogs, not about the query behind them.
const mockUseFetchMapById = jest.fn();
jest.mock('../../../../src/utils/redirect', () => ({
  ...jest.requireActual('../../../../src/utils/redirect'),
  reloadPage: jest.fn(),
}));
jest.mock('../../../../src/classes/middleware', () => ({
  ...jest.requireActual('../../../../src/classes/middleware'),
  useFetchMapById: (id: number) => mockUseFetchMapById(id),
}));

import RenameDialog from '../../../../src/components/maps-page/action-dispatcher/rename-dialog';
import DeleteDialog from '../../../../src/components/maps-page/action-dispatcher/delete-dialog';
import DeleteMultiselectDialog from '../../../../src/components/maps-page/action-dispatcher/delete-multiselect-dialog';
import CreateDialog from '../../../../src/components/maps-page/action-dispatcher/create-dialog';
import InfoDialog from '../../../../src/components/maps-page/action-dispatcher/info-dialog';
import HistoryDialog from '../../../../src/components/maps-page/action-dispatcher/history-dialog';
import { reloadPage } from '../../../../src/utils/redirect';
import Client, {
  ChangeHistory,
  MAP_DESCRIPTION_MAX_LENGTH,
  MAP_TITLE_MAX_LENGTH,
  MapInfo,
} from '../../../../src/classes/client';
import { renderWithProviders } from '../../helpers/render';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';

const map: MapInfo = {
  id: 7,
  title: 'Travel plans',
  description: 'Summer trip',
  starred: true,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T10:00:00Z',
  lastModificationBy: 'diego@wisemapping.com',
  lastModificationTime: '2026-01-02T10:00:00Z',
  public: false,
  role: 'owner',
};

const button = (name: string): HTMLButtonElement =>
  screen.getByRole('button', { name }) as HTMLButtonElement;

const textbox = (name: RegExp): HTMLInputElement =>
  screen.getByRole('textbox', { name }) as HTMLInputElement;

beforeEach(() => {
  mockUseFetchMapById.mockReturnValue({ isLoading: false, error: null, data: map });
});

describe('RenameDialog', () => {
  const setup = (mapId = 7) => {
    const renameMap = jest.fn<Promise<void>, [number, unknown]>(() => Promise.resolve());
    const onClose = jest.fn();
    renderWithProviders(<RenameDialog mapId={mapId} onClose={onClose} />, {
      client: { renameMap } as unknown as Client,
    });
    return { renameMap, onClose };
  };

  test('prefills the current name and description', async () => {
    setup();
    expect(await screen.findByDisplayValue('Travel plans')).toBeTruthy();
    expect(screen.getByDisplayValue('Summer trip')).toBeTruthy();
    expect(screen.getByText('Please, fill the new map name and description.')).toBeTruthy();
  });

  test('the name takes as many characters as the backend stores', async () => {
    setup();
    await screen.findByDisplayValue('Travel plans');
    expect(textbox(/Name/).maxLength).toBe(MAP_TITLE_MAX_LENGTH);
  });

  test('the description takes as many characters as the backend accepts', async () => {
    setup();
    await screen.findByDisplayValue('Summer trip');
    expect(textbox(/Description/).maxLength).toBe(MAP_DESCRIPTION_MAX_LENGTH);
  });

  test('renames the map with what the user typed and closes', async () => {
    const { renameMap, onClose } = setup();
    await screen.findByDisplayValue('Travel plans');

    fireEvent.change(textbox(/Name/), { target: { value: 'Winter plans' } });
    fireEvent.change(textbox(/Description/), { target: { value: 'Ski trip' } });
    fireEvent.click(button('Rename'));

    await waitFor(() =>
      expect(renameMap).toHaveBeenCalledWith(7, { title: 'Winter plans', description: 'Ski trip' }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('changing only the description does not send the title again', async () => {
    // The backend refuses a title the user already has, the map's own included: sending the
    // unchanged title made a description-only edit fail with "You already have a mindmap...".
    const { renameMap, onClose } = setup();
    await screen.findByDisplayValue('Travel plans');

    fireEvent.change(textbox(/Description/), { target: { value: 'Ski trip' } });
    fireEvent.click(button('Rename'));

    await waitFor(() => expect(renameMap).toHaveBeenCalledTimes(1));
    expect(renameMap.mock.calls[0]).toEqual([7, { description: 'Ski trip' }]);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('changing only the name does not send the description again', async () => {
    const { renameMap } = setup();
    await screen.findByDisplayValue('Travel plans');

    fireEvent.change(textbox(/Name/), { target: { value: 'Winter plans' } });
    fireEvent.click(button('Rename'));

    await waitFor(() => expect(renameMap).toHaveBeenCalledTimes(1));
    expect(renameMap.mock.calls[0]).toEqual([7, { title: 'Winter plans' }]);
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    const { renameMap } = setup();
    await screen.findByDisplayValue('Travel plans');
    fireEvent.change(textbox(/Name/), { target: { value: '' } });

    expect(await typeInBurst(textbox(/Name/))).toEqual([]);
    expect(await typeInBurst(textbox(/Description/))).toEqual([]);
    fireEvent.click(button('Rename'));

    await waitFor(() =>
      expect(renameMap).toHaveBeenCalledWith(7, {
        title: BURST_TEXT,
        description: `Summer trip${BURST_TEXT}`,
      }),
    );
  });

  test('shows a server error next to the name and keeps the dialog open', async () => {
    const { renameMap, onClose } = setup();
    renameMap.mockRejectedValue({
      msg: 'Name already in use',
      fields: { title: 'A map with this name exists' },
    });
    await screen.findByDisplayValue('Travel plans');

    fireEvent.click(button('Rename'));

    expect(await screen.findByText('Name already in use')).toBeTruthy();
    expect(screen.getByText('A map with this name exists')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();

    // Typing again clears the error.
    fireEvent.change(textbox(/Name/), { target: { value: 'Other name' } });
    await waitFor(() => expect(screen.queryByText('Name already in use')).toBeNull());
  });

  test('refuses an invalid map id', async () => {
    const { renameMap } = setup(Number.NaN);

    expect(await screen.findByText('Invalid map ID')).toBeTruthy();
    fireEvent.submit(button('Rename').closest('form')!);

    expect(await screen.findByText('Invalid map ID')).toBeTruthy();
    expect(renameMap).not.toHaveBeenCalled();
  });

  test('cancel closes without renaming', async () => {
    const { renameMap, onClose } = setup();
    await screen.findByDisplayValue('Travel plans');

    fireEvent.click(button('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(renameMap).not.toHaveBeenCalled();
  });
});

describe('DeleteDialog', () => {
  const setup = () => {
    const deleteMap = jest.fn<Promise<void>, [number]>(() => Promise.resolve());
    const onClose = jest.fn();
    const client = {
      deleteMap,
      fetchMapMetadata: () => Promise.resolve({ id: 7, title: 'Travel plans' }),
    } as unknown as Client;
    renderWithProviders(<DeleteDialog mapId={7} onClose={onClose} />, { client });
    return { deleteMap, onClose };
  };

  test('names the map being deleted and warns it can not be recovered', async () => {
    setup();
    expect(await screen.findByText('Delete Travel plans')).toBeTruthy();
    expect(
      screen.getByText('Deleted mindmap can not be recovered. Do you want to continue ?.'),
    ).toBeTruthy();
  });

  test('deletes the map and closes reporting success', async () => {
    const { deleteMap, onClose } = setup();
    await screen.findByText('Delete Travel plans');

    fireEvent.click(button('Delete'));

    await waitFor(() => expect(deleteMap).toHaveBeenCalledWith(7));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
  });

  test('shows why the map could not be deleted', async () => {
    const { deleteMap, onClose } = setup();
    deleteMap.mockRejectedValue({ msg: 'Only the owner can delete this map' });

    fireEvent.click(button('Delete'));

    expect(await screen.findByText('Only the owner can delete this map')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('cancel closes without a result', () => {
    const { deleteMap, onClose } = setup();

    fireEvent.click(button('Cancel'));

    expect(onClose).toHaveBeenCalledWith();
    expect(deleteMap).not.toHaveBeenCalled();
  });
});

describe('DeleteMultiselectDialog', () => {
  const listed = (id: number, title: string): MapInfo => ({ ...map, id, title });

  const setup = (mapsId = [3, 4]) => {
    const deleteMaps = jest.fn<Promise<void>, [number[]]>(() => Promise.resolve());
    const onClose = jest.fn();
    const maps = Array.from({ length: 8 }, (_, i) => listed(i + 1, `Map ${i + 1}`));
    renderWithProviders(<DeleteMultiselectDialog mapsId={mapsId} onClose={onClose} />, {
      client: { deleteMaps } as unknown as Client,
      queryData: [[['maps'], maps]],
    });
    return { deleteMaps, onClose };
  };

  test('deletes every selected map and closes reporting success', async () => {
    const { deleteMaps, onClose } = setup();

    fireEvent.click(button('Delete'));

    await waitFor(() => expect(deleteMaps).toHaveBeenCalledWith([3, 4]));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
  });

  test('says how many maps will be deleted, and which', () => {
    // "Select all" takes the maps of every page: the confirmation used to say only "All
    // selected maps will be deleted".
    setup([3, 4]);

    expect(screen.getByText('2 maps will be deleted')).toBeTruthy();
    expect(screen.getByText('Map 3')).toBeTruthy();
    expect(screen.getByText('Map 4')).toBeTruthy();
  });

  test('names the first five maps and counts the rest', () => {
    setup([1, 2, 3, 4, 5, 6, 7, 8]);

    expect(screen.getByText('8 maps will be deleted')).toBeTruthy();
    expect(screen.getByText('Map 5')).toBeTruthy();
    expect(screen.queryByText('Map 6')).toBeNull();
    expect(screen.getByText('and 3 more')).toBeTruthy();
  });

  test('shows a failed delete and keeps the dialog open', async () => {
    const { deleteMaps, onClose } = setup();
    deleteMaps.mockRejectedValue({ msg: 'Could not delete' });

    fireEvent.click(button('Delete'));

    expect(await screen.findByText('Could not delete')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('cancel closes without a result', () => {
    const { onClose } = setup();
    fireEvent.click(button('Cancel'));
    expect(onClose).toHaveBeenCalledWith();
  });
});

describe('CreateDialog', () => {
  const setup = () => {
    const createMap = jest.fn<Promise<number>, [unknown]>(() => Promise.resolve(99));
    const onClose = jest.fn();
    renderWithProviders(<CreateDialog onClose={onClose} />, {
      client: { createMap } as unknown as Client,
    });
    return { createMap, onClose };
  };

  test('creates a map with the typed name and description', async () => {
    const { createMap, onClose } = setup();
    expect(screen.getByText('Create a new mindmap')).toBeTruthy();

    fireEvent.change(textbox(/Name/), { target: { value: 'Roadmap' } });
    fireEvent.change(textbox(/Description/), { target: { value: 'Q3 goals' } });
    fireEvent.click(button('Create'));

    await waitFor(() =>
      expect(createMap).toHaveBeenCalledWith({ title: 'Roadmap', description: 'Q3 goals' }),
    );
    // On success the browser goes to the new map's editor, it is not just closed.
    expect(onClose).not.toHaveBeenCalled();
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    const { createMap } = setup();

    expect(await typeInBurst(textbox(/Name/))).toEqual([]);
    expect(await typeInBurst(textbox(/Description/))).toEqual([]);
    fireEvent.click(button('Create'));

    await waitFor(() =>
      expect(createMap).toHaveBeenCalledWith({
        title: BURST_TEXT,
        description: BURST_TEXT,
      }),
    );
  });

  test('the name takes as many characters as the backend stores, as rename and duplicate do', async () => {
    const { createMap } = setup();
    // The mindmap.title column is a VARCHAR(255).
    expect(MAP_TITLE_MAX_LENGTH).toBe(255);
    expect(textbox(/Name/).maxLength).toBe(MAP_TITLE_MAX_LENGTH);

    expect(await typeInBurst(textbox(/Name/), 'x'.repeat(MAP_TITLE_MAX_LENGTH + 5))).toEqual([]);
    fireEvent.click(button('Create'));

    await waitFor(() =>
      expect(createMap).toHaveBeenCalledWith({
        title: 'x'.repeat(MAP_TITLE_MAX_LENGTH),
        description: '',
      }),
    );
  });

  test('the description takes as many characters as the backend accepts', async () => {
    const { createMap } = setup();
    // The backend's MapInfoValidator rejects a description longer than 512 characters.
    expect(MAP_DESCRIPTION_MAX_LENGTH).toBe(512);
    expect(textbox(/Description/).maxLength).toBe(MAP_DESCRIPTION_MAX_LENGTH);

    fireEvent.change(textbox(/Name/), { target: { value: 'Roadmap' } });
    const description = textbox(/Description/);
    fireEvent.change(description, {
      target: { value: 'x'.repeat(MAP_DESCRIPTION_MAX_LENGTH) },
    });
    fireEvent.click(button('Create'));

    await waitFor(() =>
      expect(createMap).toHaveBeenCalledWith({
        title: 'Roadmap',
        description: 'x'.repeat(MAP_DESCRIPTION_MAX_LENGTH),
      }),
    );
  });

  test('shows the server validation errors', async () => {
    const { createMap } = setup();
    createMap.mockRejectedValue({
      msg: 'Could not create the map',
      fields: { title: 'Name already exists' },
    });
    fireEvent.change(textbox(/Name/), { target: { value: 'Roadmap' } });

    fireEvent.click(button('Create'));

    expect(await screen.findByText('Could not create the map')).toBeTruthy();
    expect(screen.getByText('Name already exists')).toBeTruthy();
  });

  test('cancel closes and forgets the typed values', () => {
    const { createMap, onClose } = setup();
    fireEvent.change(textbox(/Name/), { target: { value: 'Roadmap' } });

    fireEvent.click(button('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(createMap).not.toHaveBeenCalled();
    expect(textbox(/Name/).value).toBe('');
  });
});

describe('InfoDialog', () => {
  test('lists the map details and its public visibility', () => {
    const onClose = jest.fn();
    renderWithProviders(<InfoDialog mapId={7} onClose={onClose} />, { client: {} as Client });

    expect(screen.getByText('Travel plans')).toBeTruthy();
    expect(screen.getByText('Summer trip')).toBeTruthy();
    expect(screen.getByText('ana@wisemapping.com')).toBeTruthy();
    expect(screen.getByText('diego@wisemapping.com')).toBeTruthy();
    // Starred, then publicly visible.
    expect(screen.getByText('true')).toBeTruthy();
    expect(screen.getByText('false')).toBeTruthy();
    expect(mockUseFetchMapById).toHaveBeenCalledWith(7);

    // Info has nothing to submit: the only action closes it.
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    fireEvent.click(button('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders while the map is still loading', () => {
    mockUseFetchMapById.mockReturnValue({ isLoading: true, error: null, data: undefined });
    renderWithProviders(<InfoDialog mapId={7} onClose={jest.fn()} />, { client: {} as Client });

    expect(screen.getByText('Basic Info')).toBeTruthy();
    expect(screen.getAllByText('false')).toHaveLength(2);
  });
});

describe('HistoryDialog', () => {
  const history: ChangeHistory[] = [
    { id: 31, lastModificationBy: 'ana@wisemapping.com', lastModificationTime: '2026-01-01' },
    { id: 32, lastModificationBy: 'diego@wisemapping.com', lastModificationTime: '2026-01-02' },
  ];

  const setup = (changes: ChangeHistory[], beforeRevert?: () => Promise<void>) => {
    const fetchHistory = jest.fn(() => Promise.resolve(changes));
    const revertHistory = jest.fn<Promise<void>, [number, number]>(() => Promise.resolve());
    const onClose = jest.fn();
    renderWithProviders(<HistoryDialog mapId={7} onClose={onClose} beforeRevert={beforeRevert} />, {
      client: { fetchHistory, revertHistory } as unknown as Client,
    });
    return { fetchHistory, revertHistory, onClose };
  };

  beforeEach(() => jest.mocked(reloadPage).mockClear());

  test('says when the map has no recorded changes', async () => {
    const { fetchHistory } = setup([]);
    expect(await screen.findByText('There is no changes available')).toBeTruthy();
    expect(fetchHistory).toHaveBeenCalledWith(7);
  });

  test('lists each change with a link to view that version', async () => {
    setup(history);

    expect(await screen.findByText('ana@wisemapping.com')).toBeTruthy();
    expect(screen.getByText('diego@wisemapping.com')).toBeTruthy();
    const views = screen.getAllByRole('link', { name: 'View' });
    expect(views.map((link) => link.getAttribute('href'))).toEqual([
      '/c/maps/7/31/view',
      '/c/maps/7/32/view',
    ]);
  });

  test('reverting a version restores it and closes the dialog', async () => {
    const { revertHistory, onClose } = setup(history);
    await screen.findByText('ana@wisemapping.com');

    fireEvent.click(screen.getAllByRole('link', { name: 'Revert' })[1]);

    await waitFor(() => expect(revertHistory).toHaveBeenCalledWith(7, 32));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  test('from the editor, the pending changes are saved and saving stops before reverting', async () => {
    // Otherwise the editor's save on unload pushed the map back over the revert.
    const order: string[] = [];
    const beforeRevert = jest.fn(async () => {
      order.push('stop saving');
    });
    const { revertHistory } = setup(history, beforeRevert);
    revertHistory.mockImplementation(async () => {
      order.push('revert');
    });
    jest.mocked(reloadPage).mockImplementation(() => order.push('reload'));
    await screen.findByText('ana@wisemapping.com');

    fireEvent.click(screen.getAllByRole('link', { name: 'Revert' })[0]);

    await waitFor(() => expect(order).toEqual(['stop saving', 'revert', 'reload']));
  });

  test('a failed revert is shown, and nothing is reloaded', async () => {
    const { revertHistory, onClose } = setup(history);
    revertHistory.mockRejectedValue({ msg: 'Revert refused' });
    await screen.findByText('ana@wisemapping.com');

    fireEvent.click(screen.getAllByRole('link', { name: 'Revert' })[0]);

    expect(await screen.findByText('Revert refused')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(reloadPage).not.toHaveBeenCalled();
  });

  test('a second click while reverting sends nothing more', async () => {
    const { revertHistory } = setup(history);
    revertHistory.mockReturnValue(new Promise(() => undefined));
    await screen.findByText('ana@wisemapping.com');

    fireEvent.click(screen.getAllByRole('link', { name: 'Revert' })[0]);
    await waitFor(() => expect(revertHistory).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole('link', { name: 'Revert' })[1]);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(revertHistory).toHaveBeenCalledTimes(1);
  });

  test('close button closes the dialog', () => {
    const { onClose } = setup([]);
    fireEvent.click(button('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
