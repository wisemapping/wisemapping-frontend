import React from "react";
import { Button, Dialog as DialogUI, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import GlobalError from "../../form/global-error";
import { ErrorInfo } from "../../../services/Service";

export type DialogProps = {
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    open: boolean;
    children: any;
    error?: ErrorInfo;
    
    title: MessageDescriptor;
    description:MessageDescriptor;
    submitButton: MessageDescriptor; 
}

const Dialog = (props: DialogProps) => {
    const intl = useIntl();
    const handleOnClose = props.onClose;
    const isOpen = props.open;
    const handleOnSubmit = props.onSubmit;

    return (
        <div>
            <DialogUI
                open={isOpen}
                onClose={handleOnClose} >
                <form autoComplete="off" onSubmit={handleOnSubmit}>
                    <DialogTitle>
                        {intl.formatMessage(props.title)}
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>{intl.formatMessage(props.description)}</DialogContentText>
                        <GlobalError error={props.error} />
                        
                        {props.children}
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" variant="outlined" type="submit">
                            <FormattedMessage id="action.rename-button" defaultMessage="Rename" />
                        </Button>

                        <Button color="secondary" variant="outlined" autoFocus onClick={handleOnClose}>
                            <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
                        </Button>
                    </DialogActions>
                </form>
            </DialogUI>
        </div>
    );
}

export default Dialog;