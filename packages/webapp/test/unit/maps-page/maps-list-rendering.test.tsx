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

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ConfigType } from 'dayjs';

/**
 * Counts the renders of each row and card: both read their map's date while rendering, and each
 * map has a date of its own.
 */
const mockDateReads: string[] = [];
jest.mock('../../../src/classes/app-i18n/dates', () => {
  const actual = jest.requireActual('../../../src/classes/app-i18n/dates');
  return {
    ...actual,
    useDate: () => {
      const date = actual.useDate();
      return (value: ConfigType) => {
        mockDateReads.push(String(value));
        return date(value);
      };
    },
  };
});

jest.mock('../../../src/components/maps-page/action-dispatcher', () => ({
  __esModule: true,
  default: () => null,
}));

import { MapsList } from '../../../src/components/maps-page/maps-list';
import { MapInfo } from '../../../src/classes/client';
import { renderWithWrapper } from '../cov-pages/providers';

const map = (id: number, title: string): MapInfo => ({
  id,
  title,
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: `2026-0${id}-01T00:00:00Z`,
  description: '',
  public: false,
  role: 'owner',
});

// Every title has an "a": a search for it lists them all.
const maps = [map(1, 'Alpha plan'), map(2, 'Beta notes'), map(3, 'Gamma ideas')];

/** How many times each map's row (or card) has rendered so far. */
const renders = (): Record<string, number> =>
  Object.fromEntries(
    maps.map((m) => [
      m.title,
      mockDateReads.filter((read) => read === m.lastModificationTime).length,
    ]),
  );

const setNarrowScreen = (narrow: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: narrow && query.includes('max-width'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
    }),
  });
};

const renderList = async () => {
  const client = {
    fetchAllMaps: jest.fn().mockResolvedValue(maps),
    updateStarred: jest.fn().mockResolvedValue(undefined),
  };
  renderWithWrapper(<MapsList filter={{ type: 'all' }} />, { client });
  await screen.findByText('Alpha plan');
  return client;
};

const rowFor = (title: string): HTMLElement => {
  const row = screen.getByText(title).closest('tr');
  if (!row) throw new Error(`No row for ${title}`);
  return row;
};

beforeEach(() => {
  mockDateReads.length = 0;
});
afterEach(() => setNarrowScreen(false));

describe('MapsList rows are memoized', () => {
  test('selecting a row re-renders that row only', async () => {
    await renderList();
    const before = renders();

    fireEvent.click(rowFor('Beta notes'));

    expect((within(rowFor('Beta notes')).getByRole('checkbox') as HTMLInputElement).checked).toBe(
      true,
    );
    const after = renders();
    expect(after['Beta notes']).toBeGreaterThan(before['Beta notes'] ?? 0);
    expect(after['Alpha plan']).toBe(before['Alpha plan']);
    expect(after['Gamma ideas']).toBe(before['Gamma ideas']);
  });

  test('typing in the search box re-renders no row that stays listed', async () => {
    await renderList();
    const before = renders();

    const search = screen.getByRole('textbox', { name: 'Search maps' });
    fireEvent.change(search, { target: { value: 'a' } });
    fireEvent.change(search, { target: { value: 'A' } });

    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(renders()).toEqual(before);
  });

  test('starring a map re-renders that row only, and so does the reload after it', async () => {
    const client = await renderList();
    const before = renders();

    fireEvent.click(
      within(rowFor('Gamma ideas')).getByTestId('StarRateRoundedIcon').closest('button')!,
    );

    // The optimistic star, then the list reloaded once the server has answered.
    await waitFor(() => expect(client.updateStarred).toHaveBeenCalledWith(3, true));
    await waitFor(() => expect(client.fetchAllMaps).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(renders()['Gamma ideas']).toBeGreaterThan(before['Gamma ideas'] ?? 0),
    );
    const after = renders();
    expect(after['Gamma ideas']).toBeGreaterThan(before['Gamma ideas'] ?? 0);
    expect(after['Alpha plan']).toBe(before['Alpha plan']);
    expect(after['Beta notes']).toBe(before['Beta notes']);
  });

  test('typing in the search box re-renders no card either', async () => {
    setNarrowScreen(true);
    await renderList();
    const before = renders();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search maps', hidden: true }), {
      target: { value: 'a' },
    });

    expect(screen.getByText('Gamma ideas')).toBeTruthy();
    expect(renders()).toEqual(before);
  });
});
