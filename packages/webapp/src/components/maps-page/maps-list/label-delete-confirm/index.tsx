import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import BaseDialog from '../../action-dispatcher/base-dialog';
import { Label } from '../../../../classes/client';

export type LabelDeleteConfirmType = {
    label: Label;
    onClose: () => void;
    onConfirm: () => void;
};

const LabelDeleteConfirm = ({ label, onClose, onConfirm }: LabelDeleteConfirmType): React.ReactElement => {
    const intl = useIntl();

    return (
        <div>
            <BaseDialog
                onClose={onClose}
                onSubmit={onConfirm}
                title={intl.formatMessage({ id: 'label.delete-title', defaultMessage: 'Confirm label deletion' })}
                submitButton={intl.formatMessage({
                    id: 'action.delete-title',
                    defaultMessage: 'Delete',
                })}
            >
                <Alert severity="warning">
                    <AlertTitle>{intl.formatMessage({ id: 'label.delete-title', defaultMessage: 'Confirm label deletion' })}</AlertTitle>
                    <span>
                        <Typography fontWeight="bold" component="span">{label.title} </Typography>
                        <FormattedMessage
                            id="label.delete-description"
                            defaultMessage="will be deleted, including its associations to all existing maps. Do you want to continue?"
                        />
                    </span>
                </Alert>
            </BaseDialog>
        </div>
    );
};

export default LabelDeleteConfirm;
