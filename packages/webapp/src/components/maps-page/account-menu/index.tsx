import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import SettingsApplicationsOutlined from '@mui/icons-material/SettingsApplicationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { fetchAccount } from '../../../redux/clientSlice';
import AccountInfoDialog from './account-info-dialog';
import ChangePasswordDialog from './change-password-dialog';
import LockOpenOutlined from '@mui/icons-material/LockOpenOutlined';
import Link from '@mui/material/Link';
import ExitToAppOutlined from '@mui/icons-material/ExitToAppOutlined';

type ActionType = 'change-password' | 'account-info' | undefined;
const AccountMenu = (): React.ReactElement => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [action, setAction] = React.useState<ActionType>(undefined);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = (event: MouseEvent) => {
    event.preventDefault();
    const elem = document.getElementById('logoutFrom') as HTMLFormElement;
    elem.submit();
  };

  const account = fetchAccount();
  return (
    <span>
      <Tooltip
        arrow={true}
        title={`${account?.firstname} ${account?.lastname} <${account?.email}>`}
      >
        <IconButton onClick={handleMenu} size="large">
          <AccountCircle fontSize="large" style={{ color: 'black' }} />
        </IconButton>
      </Tooltip>
      <Menu
        id="appbar-profile"
        anchorEl={anchorEl}
        keepMounted
        open={open}
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
        <MenuItem
          onClick={() => {
            handleClose(), setAction('account-info');
          }}
        >
          <ListItemIcon>
            <SettingsApplicationsOutlined fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="menu.account" defaultMessage="Account" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose(), setAction('change-password');
          }}
        >
          <ListItemIcon>
            <LockOpenOutlined fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="menu.change-password" defaultMessage="Change password" />
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <form action="/c/logout" method="POST" id="logoutFrom"></form>
          <Link color="textSecondary" href="/c/logout" onClick={(e) => handleLogout(e)}>
            <ListItemIcon>
              <ExitToAppOutlined fontSize="small" />
            </ListItemIcon>
            <FormattedMessage id="menu.signout" defaultMessage="Sign Out" />
          </Link>
        </MenuItem>
      </Menu>
      {action == 'change-password' && <ChangePasswordDialog onClose={() => setAction(undefined)} />}
      {action == 'account-info' && <AccountInfoDialog onClose={() => setAction(undefined)} />}
    </span>
  );
};

export default AccountMenu;
