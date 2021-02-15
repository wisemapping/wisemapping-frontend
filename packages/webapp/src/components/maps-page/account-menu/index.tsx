import { FormControl, IconButton, Link, ListItemIcon, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { AccountCircle, ExitToAppOutlined, LockOpenOutlined, SettingsApplicationsOutlined } from '@material-ui/icons';
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import Client, { ErrorInfo } from "../../../classes/client";
import { useSelector } from 'react-redux';
import { activeInstance, fetchAccount } from '../../../redux/clientSlice';
import BaseDialog from '../action-dispatcher/base-dialog';
import Input from '../../form/input';


const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [openRenameDialog, setOpenRenameDialog] = React.useState<boolean>(false);


    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const account = fetchAccount();
    return (
        <span>
            <Tooltip title={`${account?.firstName} ${account?.lastName} <${account?.email}>`}>
                <IconButton
                    onClick={handleMenu}>
                    <AccountCircle fontSize="large" style={{ color: 'black' }} />
                </IconButton >
            </Tooltip>
            <Menu id="appbar-profile"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                getContentAnchorEl={null}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <SettingsApplicationsOutlined fontSize="small" />
                    </ListItemIcon>
                    <FormattedMessage id="menu.account" defaultMessage="Account" />
                </MenuItem>

                <MenuItem onClick={() => { handleClose(), setOpenRenameDialog(true) }}>
                    <ListItemIcon>
                        <LockOpenOutlined fontSize="small" />
                    </ListItemIcon>
                    <FormattedMessage id="menu.change-password" defaultMessage="Change Password" />
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="/c/logout">
                        <ListItemIcon>
                            <ExitToAppOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="menu.signout" defaultMessage="Sign Out" />
                    </Link>
                </MenuItem>
            </Menu>
            {openRenameDialog &&
                <ChangePasswordDialog onClose={() => setOpenRenameDialog(false)} />
            }
        </span>);
}


type ChangePasswordDialogProps = {
    onClose: () => void
}

type ChangePasswordModel = {
    password: string,
    retryPassword: string
}

const defaultModel: ChangePasswordModel = { password: '', retryPassword: '' };
const ChangePasswordDialog = ({ onClose }: ChangePasswordDialogProps) => {
    const client: Client = useSelector(activeInstance);
    const [model, setModel] = React.useState<ChangePasswordModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const intl = useIntl();

    const mutation = useMutation<void, ErrorInfo, ChangePasswordModel>((model: ChangePasswordModel) => {
        return client.updateAccountPassword(model.password);
    },
        {
            onSuccess: () => {
                onClose()
            },
            onError: (error) => {
                setError(error);
            }
        }
    );

    const handleOnClose = (): void => {
        onClose();
        setModel(defaultModel);
        setError(undefined);
    };

    const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        // Check password are equal ...
        if (model.password != model.retryPassword) {
            setError({ msg: intl.formatMessage({ id: 'changepwd.password-match', defaultMessage: 'Password do not match. Please, try again.' }) });
            return;
        }

        mutation.mutate(model);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();

        const name = event.target.name;
        const value = event.target.value;
        setModel({ ...model, [name as keyof ChangePasswordModel]: value });
    }

    return (
        <div>
            <BaseDialog onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
                title={intl.formatMessage({ id: 'changepwd.title', defaultMessage: 'Change Password' })}
                description={intl.formatMessage({ id: 'changepwd.description', defaultMessage: 'Please, provide the new password for your account.' })}
                submitButton={intl.formatMessage({ id: 'changepwd.button', defaultMessage: 'Change' })}>

                <FormControl fullWidth={true}>
                    <Input name="password" type="password" label={intl.formatMessage({ id: "changepwd.password", defaultMessage: "Password" })}
                        value={model.password} onChange={handleOnChange} error={error} fullWidth={true} autoComplete="new-password" />

                    <Input name="retryPassword" type="password" label={intl.formatMessage({ id: "changepwd.confirm-password", defaultMessage: "Confirm Password" })}
                        value={model.retryPassword} onChange={handleOnChange} required={true} fullWidth={true} autoComplete="new-password" />
                </FormControl>
            </BaseDialog>
        </div>
    );
}



export default AccountMenu;