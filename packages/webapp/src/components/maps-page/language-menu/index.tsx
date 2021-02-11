import { Button, Divider, Link, ListItemIcon, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { ExitToAppOutlined, SettingsApplicationsOutlined, TranslateTwoTone } from '@material-ui/icons';
import React from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import Client, { ErrorInfo, AccountInfo } from "../../../client";
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../redux/clientSlice';


const LanguageMenu = () => {

    const client: Client = useSelector(activeInstance);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
        return client.fetchAccountInfo();
    });

    return (
        <span>
            <Tooltip title="Change Language">
                <Button
                    size="small"
                    variant="outlined"
                    disableElevation={true}
                    color="primary"
                    onClick={handleMenu}
                    startIcon={<TranslateTwoTone />}
                >
                    {data?.language == "en" ? "English" : "Español"}
                </Button>
            </Tooltip>
            <Menu id="appbar-language"
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
                    English
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    Español
                </MenuItem>

                <Divider />
                <MenuItem onClick={handleClose}>
                    Help to Translate
                </MenuItem>
            </Menu>
        </span>);
}
export default LanguageMenu;