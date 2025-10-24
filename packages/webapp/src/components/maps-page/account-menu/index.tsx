/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import SettingsApplicationsOutlined from '@mui/icons-material/SettingsApplicationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import AccountInfoDialog from './account-info-dialog';
import Link from '@mui/material/Link';
import ExitToAppOutlined from '@mui/icons-material/ExitToAppOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useNavigate } from 'react-router';
import { useFetchAccount } from '../../../classes/middleware';
import { ClientContext } from '../../../classes/provider/client-context';
import { useAdminPermissions } from '../../../classes/hooks/useAdminPermissions';

type ActionType = 'account-info' | undefined;
const AccountMenu = (): React.ReactElement => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [action, setAction] = React.useState<ActionType>(undefined);
  const client = useContext(ClientContext);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    client.logout();
    navigate('/c/login');
  };

  const account = useFetchAccount();
  const { isAdmin } = useAdminPermissions();
  return (
    <span>
      <Tooltip
        arrow={true}
        title={`${account?.firstname} ${account?.lastname} <${account?.email}>`}
      >
        <IconButton onClick={handleMenu} size="large">
          <AccountCircle fontSize="large" />
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
            handleClose();
            setAction('account-info');
          }}
        >
          <ListItemIcon>
            <SettingsApplicationsOutlined fontSize="small" />
          </ListItemIcon>
          <FormattedMessage id="menu.account" defaultMessage="Account" />
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/c/admin');
            }}
          >
            <ListItemIcon>
              <AdminPanelSettingsOutlined fontSize="small" />
            </ListItemIcon>
            <FormattedMessage id="menu.admin-console" defaultMessage="Admin Console" />
          </MenuItem>
        )}

        <MenuItem onClick={handleClose}>
          <Link color="textSecondary" href="/c/logout" onClick={(e) => handleLogout(e)}>
            <ListItemIcon>
              <ExitToAppOutlined fontSize="small" />
            </ListItemIcon>
            <FormattedMessage id="menu.signout" defaultMessage="Sign Out" />
          </Link>
        </MenuItem>
      </Menu>
      {action == 'account-info' && <AccountInfoDialog onClose={() => setAction(undefined)} />}
    </span>
  );
};

export default AccountMenu;
