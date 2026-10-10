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

import { Label, MapInfo } from '../../../src/classes/client';
import {
  getComparator,
  isLabelFilter,
  mapsFilter,
  stableSort,
} from '../../../src/components/maps-page/maps-list/model';

const label = (id: number): Label => ({ id, title: `label ${id}`, color: '#fff' });

const map = (overrides: Partial<MapInfo> = {}): MapInfo => ({
  id: 1,
  title: 'Plan',
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: '2026-01-01T00:00:00Z',
  description: '',
  public: false,
  role: 'owner',
  ...overrides,
});

describe('getComparator and stableSort', () => {
  const titles = (maps: MapInfo[]) => maps.map((m) => m.title);
  const maps = [map({ id: 1, title: 'b' }), map({ id: 2, title: 'c' }), map({ id: 3, title: 'a' })];

  test('ascending puts the smaller first, descending the greater', () => {
    expect(titles(stableSort(maps, getComparator('asc', 'title')))).toEqual(['a', 'b', 'c']);
    expect(titles(stableSort(maps, getComparator('desc', 'title')))).toEqual(['c', 'b', 'a']);
  });

  test('equal items keep their original order, in both directions', () => {
    const same = [
      map({ id: 1, title: 'x' }),
      map({ id: 2, title: 'x' }),
      map({ id: 3, title: 'x' }),
    ];
    const ids = (list: MapInfo[]) => list.map((m) => m.id);

    expect(ids(stableSort(same, getComparator('asc', 'title')))).toEqual([1, 2, 3]);
    expect(ids(stableSort(same, getComparator('desc', 'title')))).toEqual([1, 2, 3]);
  });

  test('sorts booleans and does not change the list it is given', () => {
    const starred = [map({ id: 1 }), map({ id: 2, starred: true })];
    const copy = [...starred];

    expect(stableSort(starred, getComparator('desc', 'starred')).map((m) => m.id)).toEqual([2, 1]);
    expect(starred).toEqual(copy);
  });

  test('a missing value compares as equal, so the order holds', () => {
    const list = [map({ id: 1, description: undefined }), map({ id: 2, description: 'x' })];
    expect(stableSort(list, getComparator('asc', 'description')).map((m) => m.id)).toEqual([1, 2]);
  });
});

describe('mapsFilter', () => {
  const owned = map({ id: 1, title: 'Owned plan', role: 'owner' });
  const shared = map({ id: 2, title: 'Shared plan', role: 'editor', public: true });
  const starred = map({ id: 3, title: 'Starred', starred: true });
  const tagged = map({ id: 4, title: 'Tagged', labels: [label(7)] });
  const maps = [owned, shared, starred, tagged];
  const ids = (filter: Parameters<typeof mapsFilter>[0], search = '') =>
    maps.filter(mapsFilter(filter, search)).map((m) => m.id);

  test.each([
    ['all', { type: 'all' as const }, [1, 2, 3, 4]],
    ['owned', { type: 'owned' as const }, [1, 3, 4]],
    ['shared', { type: 'shared' as const }, [2]],
    ['starred', { type: 'starred' as const }, [3]],
    ['public', { type: 'public' as const }, [2]],
  ])('the %s entry', (_name, filter, expected) => {
    expect(ids(filter)).toEqual(expected);
  });

  test('the label entry lists the maps with that label', () => {
    expect(ids({ type: 'label', label: label(7) })).toEqual([4]);
    expect(ids({ type: 'label', label: label(9) })).toEqual([]);
  });

  test('an unknown entry lists nothing', () => {
    expect(ids({ type: 'bogus' } as never)).toEqual([]);
  });

  test('the search narrows the entry by title, ignoring case', () => {
    expect(ids({ type: 'all' }, 'PLAN')).toEqual([1, 2]);
    expect(ids({ type: 'shared' }, 'plan')).toEqual([2]);
    expect(ids({ type: 'all' }, 'nothing like this')).toEqual([]);
  });

  test('the search does not include a map its entry left out', () => {
    expect(ids({ type: 'starred' }, 'plan')).toEqual([]);
  });

  test('isLabelFilter tells the label entry from the others', () => {
    expect(isLabelFilter({ type: 'label', label: label(1) })).toBe(true);
    expect(isLabelFilter({ type: 'all' })).toBe(false);
  });
});
