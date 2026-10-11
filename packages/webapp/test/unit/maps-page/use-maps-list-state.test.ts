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

import { act, renderHook } from '@testing-library/react';
import { Label, MapInfo } from '../../../src/classes/client';
import type { Filter } from '../../../src/components/maps-page';
import { useMapsListState } from '../../../src/components/maps-page/maps-list/useMapsListState';

const label = (id: number): Label => ({ id, title: `label ${id}`, color: '#fff' });

const map = (id: number, overrides: Partial<MapInfo> = {}): MapInfo => ({
  id,
  title: `Map ${String(id).padStart(2, '0')}`,
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: `2026-01-${String(id).padStart(2, '0')}T00:00:00Z`,
  description: '',
  public: false,
  role: 'owner',
  ...overrides,
});

const maps = Array.from({ length: 25 }, (_, i) => map(i + 1));
const all: Filter = { type: 'all' };

const setup = (initial: { filter: Filter; maps: MapInfo[] } = { filter: all, maps }) =>
  renderHook(({ filter, maps: list }) => useMapsListState(filter, list), {
    initialProps: initial,
  });

const ids = (list: MapInfo[]) => list.map((m) => m.id);

describe('useMapsListState', () => {
  test('starts on the latest map first, ten to a page', () => {
    const { result } = setup();

    expect(ids(result.current.pagedMaps)).toEqual([25, 24, 23, 22, 21, 20, 19, 18, 17, 16]);
    expect(result.current.page).toBe(0);
    expect(result.current.filteredMaps).toHaveLength(25);
  });

  test('sorting by a column, and again to reverse it', () => {
    const { result } = setup();

    act(() => result.current.requestSort('title'));
    expect(result.current.order).toBe('asc');
    expect(ids(result.current.pagedMaps)[0]).toBe(1);

    act(() => result.current.requestSort('title'));
    expect(result.current.order).toBe('desc');
    expect(ids(result.current.pagedMaps)[0]).toBe(25);
  });

  test('paging and the page size', () => {
    const { result } = setup();

    act(() => result.current.changePage(2));
    expect(ids(result.current.pagedMaps)).toEqual([5, 4, 3, 2, 1]);

    act(() => result.current.changeRowsPerPage(20));
    expect(result.current.page).toBe(0);
    expect(result.current.pagedMaps).toHaveLength(20);
  });

  test('the page is always one that exists', () => {
    const { result, rerender } = setup();
    act(() => result.current.changePage(2));
    expect(result.current.pagedMaps).toHaveLength(5);

    // The five maps of the last page are deleted.
    rerender({ filter: all, maps: maps.slice(0, 20) });

    expect(result.current.page).toBe(1);
    expect(result.current.pagedMaps).toHaveLength(10);
  });

  test('a search narrows by title, clears the selection and goes back to the first page', () => {
    const { result } = setup();
    act(() => result.current.changePage(1));
    act(() => result.current.selectAll(true));
    expect(result.current.selected).toHaveLength(25);

    act(() => result.current.changeSearch('Map 07'));

    expect(ids(result.current.filteredMaps)).toEqual([7]);
    expect(result.current.selected).toEqual([]);
    expect(result.current.page).toBe(0);
  });

  test('selecting rows one by one, and unselecting', () => {
    const { result } = setup();

    act(() => result.current.toggleSelected(3));
    act(() => result.current.toggleSelected(7));
    act(() => result.current.toggleSelected(5));
    expect(result.current.selected).toEqual([3, 7, 5]);

    act(() => result.current.toggleSelected(7));
    expect(result.current.selected).toEqual([3, 5]);
    expect(result.current.isSelected(3)).toBe(true);
    expect(result.current.isSelected(7)).toBe(false);
  });

  test('select all takes the maps of every page, and none clears them', () => {
    const { result } = setup();

    act(() => result.current.selectAll(true));
    expect(result.current.selected).toHaveLength(25);

    act(() => result.current.selectAll(false));
    expect(result.current.selected).toEqual([]);
  });

  test('choosing another sidebar entry clears the selection and goes to the first page', () => {
    const { result, rerender } = setup();
    act(() => result.current.changePage(1));
    act(() => result.current.toggleSelected(4));

    rerender({ filter: { type: 'starred' }, maps });

    expect(result.current.selected).toEqual([]);
    expect(result.current.page).toBe(0);
    expect(result.current.filteredMaps).toEqual([]);
  });

  test('choosing the same entry again, as a new object, changes nothing', () => {
    const { result, rerender } = setup();
    act(() => result.current.changePage(1));
    act(() => result.current.toggleSelected(4));

    rerender({ filter: { type: 'all' }, maps });

    expect(result.current.selected).toEqual([4]);
    expect(result.current.page).toBe(1);
  });

  test('another label is another entry, the same label is not', () => {
    const tagged = [map(1, { labels: [label(7)] }), map(2, { labels: [label(8)] })];
    const { result, rerender } = setup({
      filter: { type: 'label', label: label(7) },
      maps: tagged,
    });
    act(() => result.current.toggleSelected(1));
    expect(ids(result.current.filteredMaps)).toEqual([1]);

    rerender({ filter: { type: 'label', label: label(7) }, maps: tagged });
    expect(result.current.selected).toEqual([1]);

    rerender({ filter: { type: 'label', label: label(8) }, maps: tagged });
    expect(result.current.selected).toEqual([]);
    expect(ids(result.current.filteredMaps)).toEqual([2]);
  });
});
