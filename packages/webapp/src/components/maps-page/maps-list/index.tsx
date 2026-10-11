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

import React, { use, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles';
import { ErrorInfo, MapInfo } from '../../../classes/client';
import { ClientContext } from '../../../classes/provider/client-context';
import { trackToolbarAction } from '../../../utils/analytics';
import { Filter } from '..';
import ActionChooser, { ActionType } from '../action-chooser';
import ActionDispatcher from '../action-dispatcher';
import { CardSkeleton, MapsListSkeleton } from './MapsListSkeleton';
import { MapCard } from './MapCard';
import { MapRow } from './MapRow';
import { MapsListToolbar } from './MapsListToolbar';
import { MapsTableHead } from './MapsTableHead';
import { ChangeLabelMutationFunctionParam, getChangeLabelMutationFunction } from './model';
import {
  ListPagination,
  ListPaper,
  ListRoot,
  ListTable,
  ListTableContainer,
  PaginationDesktop,
  PaginationMobile,
} from './styled';
import { useRemoveLabel, useStarMap } from './useMapMutations';
import { useMapsListState } from './useMapsListState';

// The label dialog imports these from here.
export type { ChangeLabelMutationFunctionParam };
export { getChangeLabelMutationFunction };

// A stable empty list: `data = []` would be a new array on every render while loading.
const NO_MAPS: MapInfo[] = [];

/** Below `sm` the list shows cards; the styles of both views switch at the same breakpoint. */
const narrowScreen = (theme: Theme): string => theme.breakpoints.down('sm');

type RowMenu = { anchor: HTMLElement; mapId: number };
type ActiveDialog = { actionType: ActionType; mapsId: number[] };

interface MapsListProps {
  filter: Filter;
}

export const MapsList = ({ filter }: MapsListProps): React.ReactElement => {
  const client = use(ClientContext);
  // Read on the first render (`noSsr`): the page never paints the other view first.
  const isMobile = useMediaQuery(narrowScreen, { noSsr: true });

  const {
    data: maps = NO_MAPS,
    // Only until the first list arrives: a background refetch keeps showing the maps.
    isPending: isLoadingMaps,
    isError: mapsLoadFailed,
  } = useQuery<unknown, ErrorInfo, MapInfo[]>({
    queryKey: ['maps'],
    queryFn: () => client.fetchAllMaps(),
  });

  const {
    order,
    orderBy,
    page,
    rowsPerPage,
    selected,
    filteredMaps,
    pagedMaps,
    requestSort,
    changePage,
    changeRowsPerPage,
    changeSearch,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useMapsListState(filter, maps);

  const [rowMenu, setRowMenu] = useState<RowMenu | undefined>(undefined);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | undefined>(undefined);

  // Every row gets these same functions: see MapItemHandlers.
  const { mutate: starMap } = useStarMap();
  const { mutate: removeLabel } = useRemoveLabel();
  const handleStar = useCallback(
    (id: number, starred: boolean) => starMap({ id, starred }),
    [starMap],
  );
  const handleRemoveLabel = useCallback(
    (mapId: number, labelId: number) => removeLabel({ mapId, labelId }),
    [removeLabel],
  );
  const handleOpenMenu = useCallback(
    (mapId: number, anchor: HTMLElement) => setRowMenu({ mapId, anchor }),
    [],
  );

  const handleMenuClose = (action: ActionType): void => {
    if (action && rowMenu) {
      setActiveDialog({ actionType: action, mapsId: [rowMenu.mapId] });
    }
    setRowMenu(undefined);
  };

  const openBulkDialog = (actionType: ActionType, event: string): void => {
    trackToolbarAction(event, `count:${selected.length}`);
    setActiveDialog({ actionType, mapsId: selected });
  };

  const loadFailedMessage = (
    <FormattedMessage
      id="maps.load-error"
      defaultMessage="Your maps could not be loaded. Please try again later."
    />
  );
  const emptyMessage = (
    <FormattedMessage
      id="maps.empty-result"
      defaultMessage="No matching mindmap found with the current filter criteria."
    />
  );
  // While loading, or when loading failed, the list is empty, but "no maps" would be wrong.
  const message = mapsLoadFailed
    ? loadFailedMessage
    : filteredMaps.length === 0
      ? emptyMessage
      : undefined;

  const pagination = filteredMaps.length > rowsPerPage && (
    <ListPagination
      count={filteredMaps.length}
      rowsPerPageOptions={[]}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_event, newPage) => changePage(newPage)}
      onRowsPerPageChange={(event) => changeRowsPerPage(parseInt(event.target.value, 10))}
      component="div"
    />
  );

  const cards = isLoadingMaps ? (
    <div data-testid="maps-loading" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <CardSkeleton
          // eslint-disable-next-line @eslint-react/no-array-index-key -- identical placeholders in a fixed-length list that never reorders
          key={index}
        />
      ))}
    </div>
  ) : message ? (
    <Card>
      <CardContent>{message}</CardContent>
    </Card>
  ) : (
    pagedMaps.map((map) => (
      <MapCard key={map.id} map={map} onStar={handleStar} onOpenMenu={handleOpenMenu} />
    ))
  );

  const table = (
    <ListTable size="small" stickyHeader>
      <MapsTableHead
        numSelected={selected.length}
        rowCount={filteredMaps.length}
        order={order}
        orderBy={orderBy}
        onSelectAll={selectAll}
        onRequestSort={requestSort}
      />
      <TableBody data-testid={isLoadingMaps ? 'maps-loading' : undefined} aria-busy={isLoadingMaps}>
        {isLoadingMaps ? (
          <MapsListSkeleton rowsPerPage={rowsPerPage} />
        ) : message ? (
          <TableRow>
            <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
              {message}
            </TableCell>
          </TableRow>
        ) : (
          pagedMaps.map((map) => (
            <MapRow
              key={map.id}
              map={map}
              selected={selected.includes(map.id)}
              onToggleSelected={toggleSelected}
              onStar={handleStar}
              onOpenMenu={handleOpenMenu}
              onRemoveLabel={handleRemoveLabel}
            />
          ))
        )}
      </TableBody>
    </ListTable>
  );

  return (
    <ListRoot>
      {rowMenu && (
        <ActionChooser anchor={rowMenu.anchor} onClose={handleMenuClose} mapId={rowMenu.mapId} />
      )}
      <ListPaper elevation={0}>
        <MapsListToolbar
          selectedCount={selected.length}
          onDeleteSelected={() => openBulkDialog('delete', 'delete_selected')}
          onLabelSelected={() => openBulkDialog('label', 'add_label_selected')}
          onSearchChange={changeSearch}
          end={!isMobile && pagination && <PaginationDesktop>{pagination}</PaginationDesktop>}
        />

        <ListTableContainer>
          {/* Only the view the screen shows: the other one would be rendered for nothing. */}
          {isMobile ? <div data-testid="maps-cards">{cards}</div> : table}
        </ListTableContainer>

        {isMobile && pagination && <PaginationMobile>{pagination}</PaginationMobile>}
      </ListPaper>
      <ActionDispatcher
        action={activeDialog?.actionType}
        onClose={(success) => {
          setActiveDialog(undefined);
          // A dialog that did its job leaves nothing selected.
          if (success) {
            clearSelection();
          }
        }}
        mapsId={activeDialog ? activeDialog.mapsId : []}
      />
    </ListRoot>
  );
};
