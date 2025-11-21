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
  borderTopRightRadius: '12px',
  borderBottomRightRadius: '12px',
  borderTopLeftRadius: '0px',
  borderBottomLeftRadius: '0px',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  borderTopRightRadius: '12px',
  borderBottomRightRadius: '12px',
  borderTopLeftRadius: '0px',
  borderBottomLeftRadius: '0px',
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
  const drawerWidth = drawerOpen ? 240 : 66;
  const theme = useTheme();
  const smMediaQuery = theme.breakpoints.down('sm');
  return useClasses({
    root: {
      display: 'flex',
    },
    appBar: {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      zIndex: theme.zIndex.drawer + 1,
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      [smMediaQuery]: {
        width: '100%',
      },
    },
    copilotButton: {
      marginRight: 10,
      minWidth: '130px',
      [smMediaQuery]: mobileAppbarButton,
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
      '& .MuiDrawer-paper': {
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
      },
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
        marginLeft: '5px',
        '& .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: 400,
          fontFamily: 'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
        },
        ...(!drawerOpen && {
          color: 'transparent',
          '& span': { color: 'transparent' },
        }),
      },
      '& .MuiListItemIcon-root': {
        minWidth: '24px',
        marginRight: '3px',
        '& .MuiSvgIcon-root': {
          fontSize: '20px',
        },
      },
      '& .MuiListItem-root': {
        paddingTop: '6px',
        paddingBottom: '6px',
        minHeight: '44px',
      },
      '& .MuiListItemButton-root': {
        paddingTop: '6px',
        paddingBottom: '6px',
        minHeight: '44px',
        borderRadius: '8px',
        margin: '2px 8px',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(255, 168, 0, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(255, 168, 0, 0.2)',
          },
        },
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
        '& .MuiDrawer-paper': {
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          width: '240px',
        },
      },
    },
    drawerOpen: {
      background:
        theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.grey[900],
      width: drawerWidth,
      [smMediaQuery]: {
        width: 240,
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
