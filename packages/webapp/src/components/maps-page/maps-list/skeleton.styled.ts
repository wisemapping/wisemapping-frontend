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

import AppBar from '@mui/material/AppBar';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import { alpha, styled } from '@mui/material/styles';

// The loading placeholder of the map page (see MapsListSkeleton).

export const DrawerSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  ...theme.applyStyles('dark', {
    backgroundColor: alpha(theme.palette.common.white, 0.11),
  }),
}));
export const LoadingAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginLeft: 240,
  width: 'calc(100% - 240px)',
}));
export const LoadingContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));
export const LoadingDrawer = styled('div')(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  background: theme.palette.primary.main,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  ...theme.applyStyles('dark', {
    background: theme.palette.grey[900],
  }),
}));
export const LoadingDrawerFooter = styled('div')(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
}));
export const LoadingDrawerItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));
export const LoadingDrawerList = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));
export const LoadingDrawerLogo = styled('div')({
  padding: '20px 0 20px 0',
});
export const LoadingMainContent = styled('div')({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

/** Beside the drawer. */
export const LoadingSearchToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 0,
  paddingTop: '30px',
  paddingBottom: '30px',
  margin: 0,
  boxShadow: 'none',
  backgroundColor: theme.palette.background.default,
}));
export const LoadingToolbarCenter = styled('div')({
  flex: '1 1 0',
  display: 'flex',
  justifyContent: 'center',
  minWidth: 0,
});
export const LoadingToolbarLeft = styled('div')({
  flex: '1 1 0',
  paddingLeft: '23px',
  minWidth: 0,
});
export const LoadingToolbarRight = styled('div')({
  flex: '1 1 0',
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: 0,
});
export const SkeletonBlock = styled(Skeleton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.black, 0.11),
  ...theme.applyStyles('dark', {
    backgroundColor: alpha(theme.palette.common.white, 0.11),
  }),
}));
export const SkeletonButton = styled(SkeletonBlock)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
}));

/** A placeholder over the drawer's background. */
export const SkeletonText = styled(SkeletonBlock)({
  fontSize: '0.96rem',
});
