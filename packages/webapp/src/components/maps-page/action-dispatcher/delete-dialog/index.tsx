import React, { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import { SimpleDialogProps, handleOnMutationSuccess } from '..';
import BaseDialog from '../base-dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useFetchMapById } from '../../../../classes/middleware';
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

  const { data: map } = useFetchMapById(mapId);
  const alertTitle = `${intl.formatMessage({
    id: 'action.delete-title',
    defaultMessage: 'Delete',
  })} ${map?.title}`;
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
