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

import Client, { Label, MapInfo } from '../../../classes/client';
import type { Filter, LabelFilter } from '..';

/**
 * The pure part of the map list: sorting, filtering and the label change. No React here, so it
 * is tested directly.
 */

export type Order = 'asc' | 'desc';

/** Sorts by `orderBy`: descending puts the greater value first. Equal or incomparable is 0. */
const descendingComparator = <T>(a: T, b: T, orderBy: keyof T): number => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const getComparator = <T>(order: Order, orderBy: keyof T): ((a: T, b: T) => number) =>
  order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

/** A sort that keeps the original order of equal items (Array.sort did not always). */
export const stableSort = <T>(array: T[], comparator: (a: T, b: T) => number): T[] =>
  array
    .map((item, index) => [item, index] as [T, number])
    .sort((a, b) => comparator(a[0], b[0]) || a[1] - b[1])
    .map(([item]) => item);

export const isLabelFilter = (filter: Filter): filter is LabelFilter => filter.type === 'label';

/** The maps the sidebar entry selects, narrowed by the text typed in the search box. */
export const mapsFilter =
  (filter: Filter, search: string): ((mapInfo: MapInfo) => boolean) =>
  (mapInfo: MapInfo) => {
    let result: boolean;
    switch (filter.type) {
      case 'all':
        result = true;
        break;
      case 'starred':
        result = mapInfo.starred;
        break;
      case 'owned':
        result = mapInfo.role == 'owner';
        break;
      case 'shared':
        result = mapInfo.role != 'owner';
        break;
      case 'label':
        result =
          !mapInfo.labels ||
          mapInfo.labels.some((label) => label.id === (filter as LabelFilter).label.id);
        break;
      case 'public':
        result = mapInfo.public;
        break;
      default:
        result = false;
    }

    if (search && result) {
      result = mapInfo.title.toLowerCase().indexOf(search.toLowerCase()) != -1;
    }
    return result;
  };

export type ChangeLabelMutationFunctionParam = { maps: MapInfo[]; label: Label; checked: boolean };

/** Adds the label to the maps that lack it, or removes it from those that have it. */
export const getChangeLabelMutationFunction =
  (client: Client) =>
  async ({ maps, label, checked }: ChangeLabelMutationFunctionParam): Promise<void> => {
    if (!label.id) {
      label.id = await client.createLabel(label.title, label.color);
    }
    if (checked) {
      const toAdd = maps.filter((m) => !m.labels.find((l) => l.id === label.id));
      await Promise.all(toAdd.map((m) => client.addLabelToMap(label.id, m.id)));
    } else {
      const toRemove = maps.filter((m) => m.labels.find((l) => l.id === label.id));
      await Promise.all(toRemove.map((m) => client.deleteLabelFromMap(label.id, m.id)));
    }
  };
