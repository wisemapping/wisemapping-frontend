/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { CSSObject, styled, Theme } from '@mui/material/styles';

/** The drawer is 240px wide when expanded, and shows only its icons when collapsed. */
const drawerWidthOf = (expanded: boolean): number => (expanded ? 240 : 66);

const notExpanded = (prop: PropertyKey): boolean => prop !== 'expanded';

type ExpandedProps = {
  /** Whether the desktop drawer is expanded, showing its labels. */
  expanded: boolean;
};

const openedMixin = (theme: Theme, drawerWidth: number): CSSObject => ({
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

/** On phones a toolbar button shows only its icon. */
export const mobileAppbarButton: CSSObject = {
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

/** The drawer's paper: the primary colour in light mode. */
const drawerPaper = (theme: Theme, expanded: boolean): CSSObject => ({
  background: theme.palette.primary.main,
  ...theme.applyStyles('dark', { background: theme.palette.grey[900] }),
  width: drawerWidthOf(expanded),
  [theme.breakpoints.down('sm')]: {
    width: 240,
  },
});

const desktopDrawer = (theme: Theme, expanded: boolean): CSSObject => {
  const drawerWidth = drawerWidthOf(expanded);
  return {
    width: drawerWidth,
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
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
    ...(expanded && {
      ...openedMixin(theme, drawerWidth),
      '& .MuiDrawer-paper': openedMixin(theme, drawerWidth),
    }),
    ...(!expanded && {
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
      ...(!expanded && {
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
      ...(!expanded && { display: 'none' }),
    },
  };
};

export const PageRoot = styled('div')({
  display: 'flex',
});

/** The top bar, to the right of the desktop drawer; across the whole page on phones. */
export const PageAppBar = styled(AppBar, { shouldForwardProp: notExpanded })<ExpandedProps>(({
  theme,
  expanded,
}) => {
  const drawerWidth = drawerWidthOf(expanded);
  return {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  };
});

/** Opens the drawer on phones. */
export const MobileDrawerToggle = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
  zIndex: 1300,
  position: 'relative',
}));

/** Expands or collapses the drawer from tablets up. */
export const DesktopDrawerToggle = styled(IconButton)(({ theme }) => ({
  padding: 0,
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('xs')]: {
    display: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    display: 'inherit',
  },
  zIndex: 1300,
  position: 'relative',
}));

/** New map, AI Copilot and Import: icon-only on phones. */
export const ToolbarButton = styled(Button)(({ theme }) => ({
  marginRight: 10,
  minWidth: '130px',
  [theme.breakpoints.down('sm')]: mobileAppbarButton,
}));

/** The theme, language and account menus, at the right of the toolbar. */
export const RightButtonGroup = styled('div')(({ theme }) => ({
  marginRight: 10,
  flexGrow: 10,
  textAlign: 'right',
  minWidth: '280px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
  [theme.breakpoints.down('sm')]: {
    minWidth: 'unset',
    marginRight: 0,
  },
}));

/** The drawer phones open from the toolbar. */
export const MobileDrawer = styled(Drawer, { shouldForwardProp: notExpanded })<ExpandedProps>(
  ({ theme, expanded }) => [
    {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
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
    { '& .MuiPaper-root': drawerPaper(theme, expanded) },
  ],
);

/** The drawer always shown from tablets up, expanded or collapsed to its icons. */
export const DesktopDrawer = styled(Drawer, { shouldForwardProp: notExpanded })<ExpandedProps>(
  ({ theme, expanded }) => [
    desktopDrawer(theme, expanded),
    drawerPaper(theme, expanded),
    { '& .MuiPaper-root': drawerPaper(theme, expanded) },
  ],
);

export const PageContent = styled('main')({
  flexGrow: 1,
  padding: '24px 0px',
});

/** Keeps the content below the fixed app bar. */
export const ToolbarSpacer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  minHeight: '44px',
});

/** The help button, floating at the bottom right from tablets up. */
export const HelpButtonBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: 1000,
  [theme.breakpoints.up('xs')]: {
    display: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
}));

/** The page shown when the maps can not be loaded, over a translucent veil. */
