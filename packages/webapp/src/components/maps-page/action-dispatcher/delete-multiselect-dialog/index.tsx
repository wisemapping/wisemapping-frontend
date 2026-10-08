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

import React, { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleOnMutationSuccess, MultiDialogProps } from '..';
import BaseDialog from '../base-dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { ClientContext } from '../../../../classes/provider/client-context';
import { ErrorInfo, MapInfo } from '../../../../classes/client';

// Titles named in the confirmation; the rest are counted.
const NAMED_MAPS = 5;

const DeleteMultiselectDialog = ({ onClose, mapsId }: MultiDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorInfo>();

  // "Select all" takes the maps of every page, so the confirmation says which maps go.
  const [titles] = useState<string[]>(() => {
    const maps = queryClient.getQueryData<MapInfo[]>(['maps']) ?? [];
    return mapsId.flatMap((id) => maps.find((m) => m.id === id)?.title ?? []);
  });

  const mutation = useMutation<void, ErrorInfo, number[]>({
    mutationFn: (ids: number[]) => client.deleteMaps(ids),
    onSuccess: () => handleOnMutationSuccess(() => onClose(true), queryClient),
    onError: (error) => setError(error),
  });

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnSubmit = (): void => {
    mutation.mutate(mapsId);
  };

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        title={intl.formatMessage({ id: 'action.delete-title', defaultMessage: 'Delete' })}
        submitButton={intl.formatMessage({
          id: 'action.delete-title',
          defaultMessage: 'Delete',
        })}
        isLoading={mutation.isPending}
        error={error}
      >
        <Alert severity="warning">
          <AlertTitle>
            <FormattedMessage
              id="deletem.count-title"
              defaultMessage="{count, plural, one {# map will be deleted} other {# maps will be deleted}}"
              values={{ count: mapsId.length }}
            />
          </AlertTitle>
          {titles.length > 0 && (
            <ul style={{ margin: '0 0 8px', paddingInlineStart: '20px' }}>
              {titles.slice(0, NAMED_MAPS).map((title, index) => (
                <li key={index}>{title}</li>
              ))}
              {mapsId.length > NAMED_MAPS && (
                <li>
                  <FormattedMessage
                    id="deletem.more"
                    defaultMessage="and {count} more"
                    values={{ count: mapsId.length - NAMED_MAPS }}
                  />
                </li>
              )}
            </ul>
          )}
          <FormattedMessage
            id="action.delete-description"
            defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?."
          />
        </Alert>
      </BaseDialog>
    </div>
  );
};

export default DeleteMultiselectDialog;
