import { Button, Link, ListItemIcon, Menu, MenuItem, Tooltip } from "@material-ui/core";
import { AccountCircle, ExitToAppOutlined, SettingsApplicationsOutlined } from "@material-ui/icons";
import React from "react";
import { FormattedMessage } from "react-intl";

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <span>
            <Tooltip title="Paulo Veiga <pveiga@gmail.com>">
                <Button
                    aria-haspopup="true"
                    onClick={handleMenu}>
                    <AccountCircle fontSize="large" />
                Paulo Veiga
            </Button >
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