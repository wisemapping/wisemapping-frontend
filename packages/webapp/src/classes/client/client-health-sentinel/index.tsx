import { useSelector } from 'react-redux';
import React from "react";
import { activeInstanceStatus, ClientStatus } from '../../../redux/clientSlice';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Alert, AlertTitle } from '@material-ui/lab';

const ClientHealthSentinel = () => {
    const status: ClientStatus = useSelector(activeInstanceStatus);

    const handleOnClose = () => {
        window.location.href = '/c/login';
    }

    return (
        <div>
            <Dialog
                open={status.state != 'healthy'}
                onClose={handleOnClose}
                maxWidth="sm"
                fullWidth={true}>

                <DialogTitle>
                    <FormattedMessage id="expired.title" defaultMessage="Your session has expired" />
                </DialogTitle>

                <DialogContent>
                    <Alert severity="error">
                        <AlertTitle><FormattedMessage id="expired.description" defaultMessage="Your current session has expired. Please, sign in and try again." /></AlertTitle>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        type="button"
                        color="primary"
                        size="medium"
                        onClick={handleOnClose} >
                        <FormattedMessage id="action.close-button" defaultMessage="Close" />
                    </Button>
                </DialogActions>

            </Dialog>
        </div>
    )
};
export default ClientHealthSentinel;