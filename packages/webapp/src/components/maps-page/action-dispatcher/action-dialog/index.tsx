import React from "react";
import { DialogActions, DialogContentText, DialogTitle } from "@material-ui/core";
import { FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import { ErrorInfo } from "../../../../services/Service";
import { ButtonStyled, StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from "./style";
import GlobalError from "../../../form/global-error";

export type DialogProps = {
    onClose: () => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    open: boolean;
    children: any;
    error?: ErrorInfo;

    title: MessageDescriptor;
    description?: MessageDescriptor;
    submitButton?: MessageDescriptor;
}

const BaseDialog = (props: DialogProps) => {
    const intl = useIntl();
    const handleOnClose = props.onClose;
    const isOpen = props.open;
    const handleOnSubmit = props.onSubmit;

    const description = props.description ? (<DialogContentText>{intl.formatMessage(props.description)}</DialogContentText>) : null;

    return (
        <div>
            <StyledDialog
                open={isOpen}
                onClose={handleOnClose}
                maxWidth="sm"
                fullWidth={true}>
                <form autoComplete="off" onSubmit={handleOnSubmit}>
                    <StyledDialogTitle>
                        {intl.formatMessage(props.title)}
                    </StyledDialogTitle>

                    <StyledDialogContent>
                        {description}
                        <GlobalError error={props.error} />
                        {props.children}
                    </StyledDialogContent>

                    <StyledDialogActions>
                        {handleOnSubmit ? (
                            <ButtonStyled color="primary" size="medium" variant="outlined" type="submit">
                                {intl.formatMessage(props.title)}
                            </ButtonStyled>) : null
                        }
                        <ButtonStyled color="secondary" size="medium" variant="outlined" autoFocus onClick={handleOnClose}>
                            {handleOnSubmit ? (<FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />) : (<FormattedMessage id="action.close-button" defaultMessage="Close" />)};
                        </ButtonStyled>
                    </StyledDialogActions>
                </form>
            </StyledDialog>
        </div>
    );
}

export default BaseDialog;