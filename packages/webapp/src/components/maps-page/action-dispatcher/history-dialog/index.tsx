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

import React, { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChangeHistory, ErrorInfo } from '../../../../classes/client';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import dayjs from 'dayjs';

import Tooltip from '@mui/material/Tooltip';
import { ClientContext } from '../../../../classes/provider/client-context';
import Button from '@mui/material/Button';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestoreIcon from '@mui/icons-material/Restore';
import UserAvatar from '../user-avatar';
import {
  HistoryActions,
  HistoryAuthor,
  HistoryEmpty,
  HistoryList,
  HistoryRow,
  HistoryText,
  HistoryTime,
} from './styled';
import { reloadPage } from '../../../../utils/redirect';

type HistoryDialogProps = SimpleDialogProps & {
  /**
   * Run before reverting, from the editor: saves its pending changes and stops it saving, or the
   * save on page unload would write the map back over the revert.
   */
  beforeRevert?: () => Promise<void>;
};

const HistoryDialog = ({
  mapId,
  onClose,
  beforeRevert,
}: HistoryDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const { data } = useQuery<unknown, ErrorInfo, ChangeHistory[]>({
    queryKey: [`history-${mapId}`],
    queryFn: () => client.fetchHistory(mapId),
    gcTime: 0, // Force reload...
  });

  const changeHistory: ChangeHistory[] = data ? data : [];

  const handleOnClose = (): void => {
    onClose();
  };

  const revert = useMutation<void, ErrorInfo, number>({
    mutationFn: async (vid: number) => {
      await beforeRevert?.();
      await client.revertHistory(mapId, vid);
    },
    onSuccess: () => {
      handleOnClose();
      // The reverted map is loaded again from the server.
      reloadPage();
    },
  });

  const handleOnClick = (event: React.MouseEvent, vid: number): void => {
    event.preventDefault();
    if (!revert.isPending) {
      revert.mutate(vid);
    }
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      error={revert.error ?? undefined}
      title={intl.formatMessage({
        id: 'action.history-title',
        defaultMessage: 'Version history',
      })}
      description={intl.formatMessage({
        id: 'action.history-description',
        defaultMessage: 'List of changes introduced in the last 90 days.',
      })}
    >
      {changeHistory.length === 0 ? (
        <HistoryEmpty>
          <HistoryIcon />
          <FormattedMessage
            id="history.no-changes"
            defaultMessage="There is no changes available"
          />
        </HistoryEmpty>
      ) : (
        <HistoryList>
          {changeHistory.map((row) => (
            <HistoryRow key={row.id}>
              <UserAvatar name={row.lastModificationBy} />
              <HistoryText>
                <HistoryAuthor>{row.lastModificationBy}</HistoryAuthor>
                <Tooltip
                  title={dayjs(row.lastModificationTime).format('lll')}
                  placement="bottom-start"
                >
                  <HistoryTime>{dayjs(row.lastModificationTime).fromNow()}</HistoryTime>
                </Tooltip>
              </HistoryText>
              <HistoryActions>
                <Button
                  size="small"
                  href={`/c/maps/${mapId}/${row.id}/view`}
                  target="history"
                  startIcon={<OpenInNewIcon fontSize="small" />}
                >
                  <FormattedMessage id="maps.view" defaultMessage="View" />
                </Button>
                <Button
                  size="small"
                  onClick={(e) => handleOnClick(e, row.id)}
                  disabled={revert.isPending}
                  startIcon={<RestoreIcon fontSize="small" />}
                >
                  <FormattedMessage id="maps.revert" defaultMessage="Revert" />
                </Button>
              </HistoryActions>
            </HistoryRow>
          ))}
        </HistoryList>
      )}
    </BaseDialog>
  );
};

export default HistoryDialog;
