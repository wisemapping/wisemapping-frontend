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

import React, { ErrorInfo, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { ChangeHistory } from '../../../../classes/client';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import dayjs from 'dayjs';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import { ClientContext } from '../../../../classes/provider/client-context';
import { StyledTableContainer, StyledHeaderCell, StyledEmptyCell } from './styled';

const HistoryDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const { data } = useQuery<unknown, ErrorInfo, ChangeHistory[]>(
    `history-${mapId}`,
    () => {
      return client.fetchHistory(mapId);
    },
    {
      cacheTime: 0, // Force reload...
    },
  );

  const changeHistory: ChangeHistory[] = data ? data : [];

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnClick = (event, vid: number): void => {
    event.preventDefault();
    client.revertHistory(mapId, vid).then(() => {
      handleOnClose();
      window.location.reload();
    });
    // Reload page after revert ...
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      title={intl.formatMessage({
        id: 'action.history-title',
        defaultMessage: 'Version history',
      })}
      description={intl.formatMessage({
        id: 'action.history-description',
        defaultMessage: 'List of changes introduced in the last 90 days.',
      })}
    >
      <StyledTableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <StyledHeaderCell align="left">
                <FormattedMessage id="maps.modified-by" defaultMessage="Modified By" />
              </StyledHeaderCell>
              <StyledHeaderCell align="left">
                <FormattedMessage id="maps.modified" defaultMessage="Modified" />
              </StyledHeaderCell>
              <StyledHeaderCell align="left"></StyledHeaderCell>
              <StyledHeaderCell align="left"></StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeHistory.length === 0 ? (
              <TableRow>
                <StyledEmptyCell colSpan={4}>
                  <FormattedMessage
                    id="history.no-changes"
                    defaultMessage="There is no changes available"
                  />
                </StyledEmptyCell>
              </TableRow>
            ) : (
              changeHistory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{row.lastModificationBy}</TableCell>
                  <TableCell align="left">
                    <Tooltip
                      title={dayjs(row.lastModificationTime).format('lll')}
                      placement="bottom-start"
                    >
                      <span>{dayjs(row.lastModificationTime).fromNow()}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    <Link href={`/c/maps/${mapId}/${row.id}/view`} target="history">
                      <FormattedMessage id="maps.view" defaultMessage="View" />
                    </Link>
                  </TableCell>
                  <TableCell align="left">
                    <Link href="#" onClick={(e) => handleOnClick(e, row.id)}>
                      <FormattedMessage id="maps.revert" defaultMessage="Revert" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </BaseDialog>
  );
};

export default HistoryDialog;
