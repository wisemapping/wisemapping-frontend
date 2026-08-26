import React, { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import Box from '@mui/material/Box';

export interface MobileNavProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const MobileLibraryNavBar = ({
  currentTab = 'all',
  onTabChange,
}: MobileNavProps): ReactElement => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: { xs: 'block', sm: 'none' },
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={currentTab}
        onChange={(_, newValue) => {
          if (onTabChange) {
            onTabChange(newValue);
          }
        }}
        sx={{
          bgcolor: 'background.paper',
          height: 64,
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 600,
          },
        }}
      >
        <BottomNavigationAction
          label={<FormattedMessage id="mobile.nav.all" defaultMessage="All Maps" />}
          value="all"
          icon={<FolderIcon />}
        />
        <BottomNavigationAction
          label={<FormattedMessage id="mobile.nav.starred" defaultMessage="Starred" />}
          value="starred"
          icon={<StarIcon />}
        />
        <BottomNavigationAction
          label={<FormattedMessage id="mobile.nav.shared" defaultMessage="Shared" />}
          value="shared"
          icon={<PeopleIcon />}
        />
        <BottomNavigationAction
          label={<FormattedMessage id="mobile.nav.account" defaultMessage="Account" />}
          value="account"
          icon={<PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export const MobileShell = ({ children }: { children: React.ReactNode }): ReactElement => {
  return (
    <Box
      sx={{
        pb: { xs: '72px', sm: 0 },
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Box>
  );
};

export default MobileLibraryNavBar;
