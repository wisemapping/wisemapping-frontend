import { Button, IconButton, Link, ListItemIcon, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { AccountCircle, ExitToAppOutlined, SettingsApplicationsOutlined } from '@material-ui/icons';
import React from "react";
import { FormattedMessage } from "react-intl";
import { useQuery, useQueryClient } from "react-query";
import Client, { ErrorInfo, AccountInfo } from "../../../client";
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../redux/clientSlice';


const AccountMenu = () => {

    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const { isLoading, error, data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
        return client.fetchAccountInfo();
    });
    const account = data;

    return (
        <span>
            <Tooltip title={`${account?.firstName} ${account?.lastName} <${account?.email}>`}>
                <IconButton
                    onClick={handleMenu}>
                    <AccountCircle fontSize="large" style={{color:'black'}}/>
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

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="/c/logout">
                        <ListItemIcon>
                            <ExitToAppOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="menu.signout" defaultMessage="Sign Out" />
                    </Link>
                </MenuItem>

            </Menu>
        </span>);
}
export default AccountMenu;