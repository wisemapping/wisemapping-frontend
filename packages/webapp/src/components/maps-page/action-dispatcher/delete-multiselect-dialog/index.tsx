import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import Client from '../../../../classes/client';
import { activeInstance } from '../../../../redux/clientSlice';
import { handleOnMutationSuccess, MultiDialogProps } from '..';
import BaseDialog from '../base-dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const DeleteMultiselectDialog = ({
    onClose,
    mapsId,
}: MultiDialogProps): React.ReactElement => {
    const intl = useIntl();
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();

    const mutation = useMutation((ids: number[]) => client.deleteMaps(ids), {
        onSuccess: () => handleOnMutationSuccess(onClose, queryClient),
        onError: (error) => {
            console.error(`Unexpected error ${error}`);
        },
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
            >
                <Alert severity="warning">
                    <AlertTitle>
                        <FormattedMessage
                            id="deletem.title"
                            defaultMessage="All selected maps will be deleted"
                        />
                    </AlertTitle>
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
