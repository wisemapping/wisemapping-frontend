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

import { useMemo, useState } from 'react';
import { MapInfo } from '../../../classes/client';
import type { Filter } from '..';
import { Order, getComparator, isLabelFilter, mapsFilter, stableSort } from './model';

/** What identifies the sidebar entry: choosing the same entry again hands over a new object. */
const entryKey = (filter: Filter): string =>
  isLabelFilter(filter) ? `label:${filter.label.id}` : filter.type;

/**
 * The state of the map list: what the sidebar and the search narrow it to, how it is sorted and
 * paged, and which rows are selected. The lists are derived from the maps and that state.
 *
 * Two rules that used to be effects and handlers scattered through the component live here:
 * - Choosing another sidebar entry clears the selection and goes back to the first page.
 * - The page is always one that exists: deleting the last map of the last page, or a search with
 *   fewer matches, no longer leaves an empty table.
 */
export interface MapsListState {
  order: Order;
  orderBy: keyof MapInfo;
  search: string;
  /** The page shown, 0-based: always one that exists. */
  page: number;
  rowsPerPage: number;
  selected: number[];
  /** The maps the entry and the search list, on every page. */
  filteredMaps: MapInfo[];
  /** The maps of the page shown, sorted. */
  pagedMaps: MapInfo[];
  requestSort: (property: keyof MapInfo) => void;
  changePage: (newPage: number) => void;
  changeRowsPerPage: (count: number) => void;
  changeSearch: (value: string) => void;
  toggleSelected: (id: number) => void;
  selectAll: (checked: boolean) => void;
  clearSelection: () => void;
  isSelected: (id: number) => boolean;
}

export const useMapsListState = (filter: Filter, maps: MapInfo[]): MapsListState => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof MapInfo>('lastModificationTime');
  const [search, setSearch] = useState('');
  const [requestedPage, setRequestedPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);

  // Adjusted while rendering, not in an effect: the list never shows a frame of the old entry's
  // selection or page.
  const key = entryKey(filter);
  const [seenKey, setSeenKey] = useState(key);
  if (seenKey !== key) {
    setSeenKey(key);
    setSelected([]);
    setRequestedPage(0);
  }

  const filteredMaps = useMemo(
    () => maps.filter(mapsFilter(filter, search)),
    [maps, filter, search],
  );
  const sortedMaps = useMemo(
    () => stableSort(filteredMaps, getComparator<MapInfo>(order, orderBy)),
    [filteredMaps, order, orderBy],
  );

  const lastPage = Math.max(0, Math.ceil(sortedMaps.length / rowsPerPage) - 1);
  const page = Math.min(requestedPage, lastPage);
  const pagedMaps = useMemo(
    () => sortedMaps.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sortedMaps, page, rowsPerPage],
  );

  return {
    order,
    orderBy,
    search,
    page,
    rowsPerPage,
    selected,
    filteredMaps,
    pagedMaps,

    /** Sorts by the column, or reverses the order if it already is the sort column. */
    requestSort: (property: keyof MapInfo): void => {
      setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
      setOrderBy(property);
    },
    changePage: (newPage: number): void => setRequestedPage(newPage),
    changeRowsPerPage: (count: number): void => {
      setRowsPerPage(count);
      setRequestedPage(0);
    },
    /** A selection kept across a search would include maps the search hides. */
    changeSearch: (value: string): void => {
      setSearch(value);
      setSelected([]);
      setRequestedPage(0);
    },
    toggleSelected: (id: number): void =>
      setSelected((current) =>
        current.includes(id) ? current.filter((other) => other !== id) : [...current, id],
      ),
    /** Every map the entry and the search list, on every page. */
    selectAll: (checked: boolean): void =>
      setSelected(checked ? filteredMaps.map((map) => map.id) : []),
    clearSelection: (): void => setSelected([]),
    isSelected: (id: number): boolean => selected.includes(id),
  };
};
