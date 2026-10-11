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

import { ReactElement, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, NavLink, useLocation } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import { AdminAppBar, AdminDrawer, LoadingBox, MainContent, NavigationButton } from './styled';
import { useAdminPermissions } from '../../../classes/hooks/useAdminPermissions';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactElement;
  path: string;
}

const AdminLayout = (): ReactElement => {
  const intl = useIntl();
  const location = useLocation();
  const { isAdmin, loading, error } = useAdminPermissions();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'admin.console.page-title',
      defaultMessage: 'Admin Console | WiseMapping',
    });
  }, [intl]);

  // Define menu items
  const menuItems: MenuItem[] = [
    {
      id: 'accounts',
      label: intl.formatMessage({
        id: 'admin.menu.accounts',
        defaultMessage: 'Accounts',
      }),
      icon: <PersonIcon />,
      path: '/c/admin/accounts',
    },
    {
      id: 'maps',
      label: intl.formatMessage({
        id: 'admin.menu.maps',
        defaultMessage: 'Maps',
      }),
      icon: <MapIcon />,
      path: '/c/admin/maps',
    },
    {
      id: 'system',
      label: intl.formatMessage({
        id: 'admin.menu.system',
        defaultMessage: 'System',
      }),
      icon: <SettingsIcon />,
      path: '/c/admin/system',
    },
  ];

  if (loading) {
    return (
      <LoadingBox>
        <CircularProgress />
      </LoadingBox>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ||
            intl.formatMessage({
              id: 'admin.error.access-denied',
              defaultMessage: 'Access denied. Admin permissions required.',
            })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AdminAppBar position="fixed">
        <Toolbar>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {intl.formatMessage({
              id: 'admin.console.title',
              defaultMessage: 'Admin Console',
            })}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {intl.formatMessage({
              id: 'admin.console.subtitle',
              defaultMessage: 'System Administration',
            })}
          </Typography>
        </Toolbar>
      </AdminAppBar>
      {/* Left Navigation Panel */}
      <AdminDrawer variant="permanent">
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AdminIcon color="primary" sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="h1"
              color="primary"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {intl.formatMessage({
                id: 'admin.console.title',
                defaultMessage: 'Admin Console',
              })}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
            }}
          >
            {intl.formatMessage({
              id: 'admin.console.description',
              defaultMessage: 'Manage users, system settings, and application configuration.',
            })}
          </Typography>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <NavigationButton
                component={NavLink}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: { fontWeight: location.pathname === item.path ? 'bold' : 'normal' },
                    },
                  }}
                />
              </NavigationButton>
            </ListItem>
          ))}
        </List>
      </AdminDrawer>
      {/* Main Content Area */}
      <MainContent component="main">
        <Container maxWidth="xl" sx={{ p: 3 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Outlet />
            </CardContent>
          </Card>
        </Container>
      </MainContent>
    </Box>
  );
};

export default AdminLayout;
