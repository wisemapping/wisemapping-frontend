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

// The dialogs and the row menu are covered by their own suites: replace them with
// stand-ins that expose what the list hands over and let the test close them.
jest.mock('../../../../src/components/maps-page/action-dispatcher', () => ({
  __esModule: true,
  default: ({
    action,
    mapsId,
    onClose,
  }: {
    action?: string;
    mapsId: number[];
    onClose: (success?: boolean) => void;
  }) =>
    action ? (
      <div data-testid="dispatcher">
        <span data-testid="dispatcher-action">{action}</span>
        <span data-testid="dispatcher-maps">{mapsId.join(',')}</span>
        <button onClick={() => onClose(true)}>dispatcher-success</button>
        <button onClick={() => onClose(false)}>dispatcher-cancel</button>
      </div>
    ) : null,
}));

jest.mock('../../../../src/components/maps-page/action-chooser', () => ({
  __esModule: true,
  default: ({ mapId, onClose }: { mapId: number; onClose: (action?: string) => void }) => (
    <div data-testid="chooser">
      <span data-testid="chooser-map">{mapId}</span>
      <button onClick={() => onClose('rename')}>chooser-rename</button>
      <button onClick={() => onClose(undefined)}>chooser-dismiss</button>
    </div>
  ),
}));

import {
  MapsList,
  getChangeLabelMutationFunction,
} from '../../../../src/components/maps-page/maps-list';
import type { Filter } from '../../../../src/components/maps-page';
import Client, { Label, MapInfo } from '../../../../src/classes/client';
import { renderWithWrapper } from '../providers';

const research: Label = { id: 7, title: 'Research', color: '#ff0000' };
const travel: Label = { id: 8, title: 'Travel', color: '#00ff00' };

const makeMap = (overrides: Partial<MapInfo> & { id: number; title: string }): MapInfo => ({
  description: '',
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: '2026-01-01T00:00:00Z',
  public: false,
  role: 'owner',
  ...overrides,
});

const defaultMaps = (): MapInfo[] => [
  makeMap({
    id: 1,
    title: 'Alpha plan',
    starred: true,
    labels: [research],
    lastModificationTime: '2026-03-01T00:00:00Z',
    createdBy: 'zed@wisemapping.com',
  }),
  makeMap({
    id: 2,
    title: 'Beta notes',
    role: 'editor',
    public: true,
    lastModificationTime: '2026-05-01T00:00:00Z',
    createdBy: 'bob@wisemapping.com',
  }),
  makeMap({
    id: 3,
    title: 'Gamma ideas',
    labels: [travel],
    lastModificationTime: '2026-04-01T00:00:00Z',
    createdBy: 'carl@wisemapping.com',
  }),
];

const buildClient = (maps: MapInfo[] = defaultMaps()) => {
  const client = {
    fetchAllMaps: jest.fn().mockResolvedValue(maps),
    fetchAccountInfo: jest.fn().mockResolvedValue({ email: 'ana@wisemapping.com' }),
    updateStarred: jest.fn().mockResolvedValue(undefined),
    deleteLabelFromMap: jest.fn().mockResolvedValue(undefined),
    addLabelToMap: jest.fn().mockResolvedValue(undefined),
    createLabel: jest.fn().mockResolvedValue(99),
  };
  return client;
};

type MockClient = ReturnType<typeof buildClient>;

const renderList = (filter: Filter = { type: 'all' }, client: MockClient = buildClient()) => {
  const utils = renderWithWrapper(<MapsList filter={filter} />, { client });
  return { ...utils, client };
};

/** Titles of the table rows (the desktop view), in display order. */
const tableTitles = (): string[] => {
  const rows = screen.getAllByRole('row').slice(1);
  return rows.map((row) => within(row).queryAllByRole('link')[0]?.textContent ?? '');
};

const rowFor = (title: string): HTMLElement => {
  const row = screen
    .getAllByRole('row')
    .find((r) => within(r).queryAllByRole('link')[0]?.textContent === title);
  if (!row) throw new Error(`No row for ${title}`);
  return row;
};

const checkboxFor = (title: string): HTMLInputElement =>
  within(rowFor(title)).getByRole('checkbox') as HTMLInputElement;

describe('MapsList', () => {
  test('lists the maps from the client, latest modification first', async () => {
    const { client } = renderList();

    await screen.findAllByText('Alpha plan');
    expect(client.fetchAllMaps).toHaveBeenCalled();
    expect(tableTitles()).toEqual(['Beta notes', 'Gamma ideas', 'Alpha plan']);
    // Each map links to its editor.
    expect(within(rowFor('Alpha plan')).getAllByRole('link')[0]).toHaveProperty(
      'href',
      expect.stringContaining('/c/maps/1/edit'),
    );
    // The creator column and the labels column are shown.
    expect(within(rowFor('Alpha plan')).getByText('zed@wisemapping.com')).toBeTruthy();
    expect(within(rowFor('Alpha plan')).getByText('Research')).toBeTruthy();
  });

  // BUG: the row checkbox is meant to be named after the map title (it points
  // `aria-labelledby` at the title link, src/components/maps-page/maps-list/index.tsx:796),
  // but the "Open for edition" Tooltip wrapping that link (index.tsx:802-809) gives the link
  // an `aria-label`, which wins in the name computation: every row checkbox is announced
  // as "Open for edition", so screen-reader users can not tell the rows apart.
  test.failing('names each row checkbox after its map title', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    expect(screen.getByRole('checkbox', { name: 'Alpha plan' })).toBeTruthy();
  });

  test('shows the empty message when there are no maps', async () => {
    const client = buildClient([]);
    renderList({ type: 'all' }, client);

    await waitFor(() => expect(client.fetchAllMaps).toHaveBeenCalled());
    expect(
      screen.getAllByText('No matching mindmap found with the current filter criteria.'),
    ).toHaveLength(2);
  });

  test.each<[string, Filter, string[]]>([
    ['owned', { type: 'owned' }, ['Gamma ideas', 'Alpha plan']],
    ['shared', { type: 'shared' }, ['Beta notes']],
    ['starred', { type: 'starred' }, ['Alpha plan']],
    ['public', { type: 'public' }, ['Beta notes']],
    ['label', { type: 'label', label: travel }, ['Gamma ideas']],
  ])('the %s filter only lists the matching maps', async (_name, filter, expected) => {
    renderList(filter);

    await screen.findAllByText(expected[0]);
    await waitFor(() => expect(tableTitles()).toEqual(expected));
  });

  test('an unknown filter type matches nothing', async () => {
    renderList({ type: 'bogus' } as unknown as Filter);

    await waitFor(() =>
      expect(
        screen.getAllByText('No matching mindmap found with the current filter criteria.'),
      ).toHaveLength(2),
    );
  });

  test('switching the filter re-filters the list; re-choosing the same entry keeps it', async () => {
    const client = buildClient();
    const { rerender } = renderList({ type: 'all' }, client);
    await screen.findAllByText('Alpha plan');

    const rerenderWith = (filter: Filter) => rerender(<MapsList filter={filter} />);

    rerenderWith({ type: 'label', label: research });
    await waitFor(() => expect(tableTitles()).toEqual(['Alpha plan']));

    // Same label again (a new object): nothing changes.
    rerenderWith({ type: 'label', label: { ...research } });
    expect(tableTitles()).toEqual(['Alpha plan']);

    // Another label.
    rerenderWith({ type: 'label', label: travel });
    await waitFor(() => expect(tableTitles()).toEqual(['Gamma ideas']));

    rerenderWith({ type: 'starred' });
    await waitFor(() => expect(tableTitles()).toEqual(['Alpha plan']));
    rerenderWith({ type: 'starred' });
    expect(tableTitles()).toEqual(['Alpha plan']);
  });

  test('the search box narrows the list by title, ignoring case', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: 'GAMMA' },
    });

    expect(tableTitles()).toEqual(['Gamma ideas']);

    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: 'nothing like this' },
    });
    expect(
      screen.getAllByText('No matching mindmap found with the current filter criteria.'),
    ).toHaveLength(2);
  });

  test('clicking a column header sorts by it, and clicking again reverses it', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    const nameHeader = screen.getByRole('button', { name: 'Name' });
    fireEvent.click(nameHeader);
    expect(tableTitles()).toEqual(['Alpha plan', 'Beta notes', 'Gamma ideas']);
    expect(screen.getByText('sorted ascending')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(tableTitles()).toEqual(['Gamma ideas', 'Beta notes', 'Alpha plan']);
    expect(screen.getByText('sorted descending')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Creator' }));
    expect(tableTitles()).toEqual(['Beta notes', 'Gamma ideas', 'Alpha plan']);

    // The labels column has no visible header, but its sort control is named.
    expect(screen.getByRole('button', { name: 'Labels' })).toBeTruthy();
  });

  test('selecting rows reveals the bulk actions and deleting sends the selection', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    expect(screen.queryByRole('button', { name: 'Delete selected' })).toBeNull();

    fireEvent.click(rowFor('Alpha plan'));
    fireEvent.click(rowFor('Gamma ideas'));

    expect(checkboxFor('Alpha plan').checked).toBe(true);
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
    expect(selectAll.getAttribute('data-indeterminate')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));

    expect(screen.getByTestId('dispatcher-action').textContent).toBe('delete');
    expect(screen.getByTestId('dispatcher-maps').textContent).toBe('1,3');

    // A cancelled dialog keeps the selection.
    fireEvent.click(screen.getByText('dispatcher-cancel'));
    expect(screen.queryByTestId('dispatcher')).toBeNull();
    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeTruthy();

    // A successful one clears it.
    fireEvent.click(screen.getByRole('button', { name: 'Add label to selected' }));
    expect(screen.getByTestId('dispatcher-action').textContent).toBe('label');
    expect(screen.getByTestId('dispatcher-maps').textContent).toBe('1,3');
    fireEvent.click(screen.getByText('dispatcher-success'));
    expect(screen.queryByRole('button', { name: 'Delete selected' })).toBeNull();
  });

  test('clicking a selected row again unselects it, whatever its position', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    const isChecked = (title: string) => checkboxFor(title).checked;

    // Select all three (in Alpha, Beta, Gamma order), then remove the middle one.
    fireEvent.click(rowFor('Alpha plan'));
    fireEvent.click(rowFor('Beta notes'));
    fireEvent.click(rowFor('Gamma ideas'));
    fireEvent.click(rowFor('Beta notes'));
    expect([isChecked('Alpha plan'), isChecked('Beta notes'), isChecked('Gamma ideas')]).toEqual([
      true,
      false,
      true,
    ]);

    // First of the selection.
    fireEvent.click(rowFor('Alpha plan'));
    expect(isChecked('Alpha plan')).toBe(false);

    // Last (and only) one.
    fireEvent.click(rowFor('Gamma ideas'));
    expect(isChecked('Gamma ideas')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Delete selected' })).toBeNull();
  });

  test('"Select all" selects every listed map and toggles back to none', async () => {
    renderList({ type: 'owned' });
    await screen.findAllByText('Alpha plan');

    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    expect(screen.getByTestId('dispatcher-maps').textContent).toBe('1,3');
    fireEvent.click(screen.getByText('dispatcher-cancel'));

    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(false);
    expect(screen.queryByRole('button', { name: 'Delete selected' })).toBeNull();
  });

  test('the star button flips the starred flag through the client', async () => {
    const { client } = renderList();
    await screen.findAllByText('Alpha plan');

    const star = within(rowFor('Gamma ideas'))
      .getByTestId('StarRateRoundedIcon')
      .closest('button') as HTMLElement;
    fireEvent.click(star);

    await waitFor(() => expect(client.updateStarred).toHaveBeenCalledWith(3, true));
    // Starring does not select the row.
    expect(checkboxFor('Gamma ideas').checked).toBe(false);
    // The list is reloaded afterwards.
    await waitFor(() => expect(client.fetchAllMaps.mock.calls.length).toBeGreaterThan(1));

    const alphaStar = within(rowFor('Alpha plan'))
      .getByTestId('StarRateRoundedIcon')
      .closest('button') as HTMLElement;
    fireEvent.click(alphaStar);
    await waitFor(() => expect(client.updateStarred).toHaveBeenCalledWith(1, false));
  });

  test('the star on the mobile card works too, and a failure is logged', async () => {
    const client = buildClient();
    client.updateStarred.mockRejectedValue({ msg: 'boom' });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderList({ type: 'all' }, client);
    await screen.findAllByText('Alpha plan');

    // The first star icons belong to the cards (rendered before the table).
    const cardStar = screen
      .getAllByTestId('StarRateRoundedIcon')[0]
      .closest('button') as HTMLElement;
    fireEvent.click(cardStar);

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith({ msg: 'boom' }));
    expect(client.updateStarred).toHaveBeenCalledWith(2, true);
  });

  test('the row menu opens for the map and its choice opens the matching dialog', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    fireEvent.click(within(rowFor('Gamma ideas')).getByRole('button', { name: 'Others' }));
    expect(screen.getByTestId('chooser-map').textContent).toBe('3');

    fireEvent.click(screen.getByText('chooser-rename'));
    expect(screen.queryByTestId('chooser')).toBeNull();
    expect(screen.getByTestId('dispatcher-action').textContent).toBe('rename');
    expect(screen.getByTestId('dispatcher-maps').textContent).toBe('3');
  });

  test('dismissing the row menu opens no dialog', async () => {
    renderList();
    await screen.findAllByText('Alpha plan');

    // The card's "Settings" button opens the same menu.
    fireEvent.click(screen.getAllByRole('button', { name: 'Settings', hidden: true })[0]);
    expect(screen.getByTestId('chooser-map').textContent).toBe('2');

    fireEvent.click(screen.getByText('chooser-dismiss'));
    expect(screen.queryByTestId('chooser')).toBeNull();
    expect(screen.queryByTestId('dispatcher')).toBeNull();
  });

  test('deleting a label chip removes it from that map', async () => {
    const { client } = renderList();
    await screen.findAllByText('Alpha plan');

    fireEvent.click(within(rowFor('Alpha plan')).getByRole('button', { name: 'Delete tag' }));

    await waitFor(() => expect(client.deleteLabelFromMap).toHaveBeenCalledWith(7, 1));
    await waitFor(() => expect(client.fetchAllMaps.mock.calls.length).toBeGreaterThan(1));
  });

  test('a failure removing a label is logged', async () => {
    const client = buildClient();
    client.deleteLabelFromMap.mockRejectedValue({ msg: 'nope' });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderList({ type: 'all' }, client);
    await screen.findAllByText('Alpha plan');

    fireEvent.click(within(rowFor('Alpha plan')).getByRole('button', { name: 'Delete tag' }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith({ msg: 'nope' }));
  });

  test('more maps than a page are paginated', async () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      makeMap({
        id: i + 1,
        title: `Map ${String(i + 1).padStart(2, '0')}`,
        lastModificationTime: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      }),
    );
    renderList({ type: 'all' }, buildClient(many));
    await screen.findAllByText('Map 12');

    expect(tableTitles()).toHaveLength(10);
    expect(tableTitles()[0]).toBe('Map 12');
    expect(screen.getAllByText('1–10 of 12').length).toBeGreaterThan(0);

    // Desktop pagination in the toolbar, mobile pagination below the table.
    fireEvent.click(screen.getAllByRole('button', { name: 'Go to next page', hidden: true })[0]);
    expect(tableTitles()).toEqual(['Map 02', 'Map 01']);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Go to previous page', hidden: true })[1],
    );
    expect(tableTitles()).toHaveLength(10);
  });
});

describe('getChangeLabelMutationFunction', () => {
  const maps = (): MapInfo[] => [
    makeMap({ id: 1, title: 'A', labels: [research] }),
    makeMap({ id: 2, title: 'B', labels: [] }),
  ];

  test('adds the label to the maps that do not have it yet', async () => {
    const client = buildClient();
    await getChangeLabelMutationFunction(client as unknown as Client)({
      maps: maps(),
      label: { ...research },
      checked: true,
    });

    expect(client.createLabel).not.toHaveBeenCalled();
    expect(client.addLabelToMap).toHaveBeenCalledTimes(1);
    expect(client.addLabelToMap).toHaveBeenCalledWith(7, 2);
  });

  test('removes the label from the maps that have it', async () => {
    const client = buildClient();
    await getChangeLabelMutationFunction(client as unknown as Client)({
      maps: maps(),
      label: { ...research },
      checked: false,
    });

    expect(client.deleteLabelFromMap).toHaveBeenCalledTimes(1);
    expect(client.deleteLabelFromMap).toHaveBeenCalledWith(7, 1);
  });

  test('creates a label that has no id yet before assigning it', async () => {
    const client = buildClient();
    const label = { title: 'New', color: '#123456' } as Label;
    await getChangeLabelMutationFunction(client as unknown as Client)({
      maps: maps(),
      label,
      checked: true,
    });

    expect(client.createLabel).toHaveBeenCalledWith('New', '#123456');
    expect(label.id).toBe(99);
    expect(client.addLabelToMap).toHaveBeenCalledWith(99, 1);
    expect(client.addLabelToMap).toHaveBeenCalledWith(99, 2);
  });
});
