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
import { useMutation, useQueryClient } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import { SimpleDialogProps, handleOnMutationSuccess } from '..';
import BaseDialog from '../base-dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useFetchMapMetadata } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';

const DeleteDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<ErrorInfo>();

  const mutation = useMutation((id: number) => client.deleteMap(id), {
    onSuccess: () => handleOnMutationSuccess(() => onClose(true), queryClient),
    onError: (error: ErrorInfo) => {
      setError(error);
    },
  });

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnSubmit = (): void => {
    mutation.mutate(mapId);
  };

  const { data: mapMetadata } = useFetchMapMetadata(mapId);
  const alertTitle = `${intl.formatMessage({
    id: 'action.delete-title',
    defaultMessage: 'Delete',
  })} ${mapMetadata?.title ?? ''}`;
  return (
    <div>
      <BaseDialog
        error={error}
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        title={intl.formatMessage({ id: 'action.delete-title', defaultMessage: 'Delete' })}
        submitButton={intl.formatMessage({
          id: 'action.delete-title',
          defaultMessage: 'Delete',
        })}
        isLoading={mutation.isLoading}
      >
        <Alert severity="warning">
          <AlertTitle>{alertTitle}</AlertTitle>
          <FormattedMessage
            id="action.delete-description"
            defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?."
          />
        </Alert>
      </BaseDialog>
    </div>
  );
};

export default DeleteDialog;
