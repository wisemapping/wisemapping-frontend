import { useSelector } from 'react-redux';
import React from 'react';
import { activeInstanceStatus, ClientStatus } from '../../../redux/clientSlice';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';

const ClientHealthSentinel = (): React.ReactElement => {
    const status: ClientStatus = useSelector(activeInstanceStatus);

    const handleOnClose = () => {
        window.location.href = '/c/login';
    };

    return (
        <div>
            <Dialog
                open={status.state != 'healthy'}
                onClose={handleOnClose}
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle>
                    <FormattedMessage
                        id="expired.title"
                        defaultMessage="Your session has expired"
                    />
                </DialogTitle>

                <DialogContent>
                    <Alert severity="error">
                        <AlertTitle>
                            <FormattedMessage
                                id="expired.description"
                                defaultMessage="Your current session has expired. Please, sign in and try again."
                            />
                        </AlertTitle>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button type="button" color="primary" size="medium" onClick={handleOnClose}>
                        <FormattedMessage id="action.close-button" defaultMessage="Close" />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
export default ClientHealthSentinel;
