/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CSSObject } from '@emotion/react';
import { Theme, useTheme } from '@mui/material/styles';
import useClasses from '../../theme/useStyles';

const openedMixin = (theme: Theme, drawerWidth): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export const mobileAppbarButton = {
  padding: 0,
  minWidth: 'unset',
  '& .message': {
    display: 'none',
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    padding: 10,
  },
};
export function useStyles(drawerOpen) {
  const drawerWidth = drawerOpen ? 300 : 66;
  const theme = useTheme();
  const smMediaQuery = theme.breakpoints.down('sm');
  return useClasses({
    root: {
      display: 'flex',
    },
    appBar: {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      [smMediaQuery]: {
        width: '100%',
      },
    },
    newMapButton: {
      marginRight: 10,
      minWidth: '130px',
      [smMediaQuery]: mobileAppbarButton,
    },
    importButton: {
      marginRight: 10,
      minWidth: '130px',
      [smMediaQuery]: mobileAppbarButton,
    },
    rightButtonGroup: {
      marginRight: 10,
      flexGrow: 10,
      textAlign: 'right',
      minWidth: '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      [smMediaQuery]: {
        minWidth: 'unset',
        marginRight: 0,
      },
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      [smMediaQuery]: {
        display: 'none',
      },
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(drawerOpen && {
        ...openedMixin(theme, drawerWidth),
        '& .MuiDrawer-paper': openedMixin(theme, drawerWidth),
      }),
      ...(!drawerOpen && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
      '& .MuiListItemText-root': {
        display: 'block',
        ...(!drawerOpen && {
          color: 'transparent',
          '& span': { color: 'transparent' },
        }),
      },
      '& .MuiListItemSecondaryAction-root, & .poweredByIcon': {
        display: 'block',
        ...(!drawerOpen && { display: 'none' }),
      },
    },
    mobileDrawer: {
      display: 'none',
      [smMediaQuery]: {
        display: 'block',
      },
    },
    drawerOpen: {
      background: theme.palette.primary.main,
      width: drawerWidth,
      [smMediaQuery]: {
        width: 300,
      },
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'flex-end',
      minHeight: '44px',
    },
    content: {
      flexGrow: 1,
      padding: '24px 0px',
    },
  });
}
