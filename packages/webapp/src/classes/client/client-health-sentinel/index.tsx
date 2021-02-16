import { useSelector } from 'react-redux';
import React from "react";
import { activeInstanceStatus, ClientStatus } from '../../../redux/clientSlice';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Alert from '@material-ui/lab/Alert';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AlertTitle from '@material-ui/lab/AlertTitle';

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