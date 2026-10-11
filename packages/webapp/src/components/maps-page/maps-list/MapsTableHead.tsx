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

import React, { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import type { SxProps, Theme } from '@mui/material/styles';
import { MapInfo } from '../../../classes/client';
import { Order } from './model';
import { HeaderCell, SelectCheckbox, VisuallyHidden } from './styled';

interface HeadCell {
  id: keyof MapInfo;
  label?: string;
  // Accessible name for a column that shows no visible header text -- without
  // it the column's sort button is a control with no name at all.
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}

interface MapsTableHeadProps {
  numSelected: number;
  rowCount: number;
  order: Order;
  orderBy: keyof MapInfo;
  onSelectAll: (checked: boolean) => void;
  onRequestSort: (property: keyof MapInfo) => void;
}

/** The header of the table: "select all" and the sortable columns. */
const MapsTableHeadComponent = ({
  numSelected,
  rowCount,
  order,
  orderBy,
  onSelectAll,
  onRequestSort,
}: MapsTableHeadProps): React.ReactElement => {
  const intl = useIntl();

  const headCells: HeadCell[] = useMemo(
    () => [
      {
        id: 'title',
        label: intl.formatMessage({ id: 'map.name', defaultMessage: 'Name' }),
      },
      {
        id: 'labels',
        ariaLabel: intl.formatMessage({ id: 'map.labels', defaultMessage: 'Labels' }),
      },
      {
        id: 'createdBy',
        label: intl.formatMessage({ id: 'map.creator', defaultMessage: 'Creator' }),
        sx: { width: '150px', whiteSpace: 'nowrap' },
      },
      {
        id: 'lastModificationTime',
        label: intl.formatMessage({ id: 'map.last-update', defaultMessage: 'Last Update' }),
        sx: { width: '70px', whiteSpace: 'nowrap' },
      },
    ],
    [intl],
  );

  return (
    <TableHead>
      <TableRow>
        <HeaderCell padding="checkbox" sx={{ width: '20px' }}>
          <SelectCheckbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event) => onSelectAll(event.target.checked)}
            size="small"
            slotProps={{
              input: {
                'aria-label': intl.formatMessage({
                  id: 'maps.select-all',
                  defaultMessage: 'Select all',
                }),
              },
            }}
          />
        </HeaderCell>

        {headCells.map((headCell) => (
          <HeaderCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCell.sx}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onRequestSort(headCell.id)}
              aria-label={headCell.label ? undefined : headCell.ariaLabel}
            >
              {headCell.label}

              {orderBy === headCell.id && (
                <VisuallyHidden>
                  {order === 'desc'
                    ? intl.formatMessage({
                        id: 'maps.sorted-descending',
                        defaultMessage: 'sorted descending',
                      })
                    : intl.formatMessage({
                        id: 'maps.sorted-ascending',
                        defaultMessage: 'sorted ascending',
                      })}
                </VisuallyHidden>
              )}
            </TableSortLabel>
          </HeaderCell>
        ))}

        <HeaderCell padding="checkbox">
          <VisuallyHidden>
            {intl.formatMessage({ id: 'maps.tooltip-starred', defaultMessage: 'Starred' })}
          </VisuallyHidden>
        </HeaderCell>
        <HeaderCell padding="checkbox">
          <VisuallyHidden>
            {intl.formatMessage({ id: 'map.actions', defaultMessage: 'Actions' })}
          </VisuallyHidden>
        </HeaderCell>
      </TableRow>
    </TableHead>
  );
};

export const MapsTableHead = memo(MapsTableHeadComponent);
