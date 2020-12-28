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
    description?: MessageDescriptor;
    submitButton: MessageDescriptor;
}

const Dialog = (props: DialogProps) => {
    const intl = useIntl();
    const handleOnClose = props.onClose;
    const isOpen = props.open;
    const handleOnSubmit = props.onSubmit;

    const description = props.description ? (<DialogContentText>{intl.formatMessage(props.description)}</DialogContentText>) : null;

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
                        {description}
                        <GlobalError error={props.error} />
                        {props.children}
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" variant="outlined" type="submit">
                            {intl.formatMessage(props.title)}
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