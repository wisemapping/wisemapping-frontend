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

import { styled } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { EDITOR_LAYOUT, EDITOR_Z_INDEX } from '../../theme/layout';

export const LoadingContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  zIndex: EDITOR_Z_INDEX.canvasChrome,
}));

export const AppBarSkeleton = styled('div')(({ theme }) => ({
  height: 48,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

export const AppBarLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const AppBarCenter = styled('div')({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
});

export const AppBarRight = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const FormattingToolbarSkeleton = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: EDITOR_LAYOUT.formattingToolbar.right,
  top: EDITOR_LAYOUT.formattingToolbar.top,
  display: 'flex',
  flexDirection: 'column',
  width: EDITOR_LAYOUT.formattingToolbar.width,
  gap: theme.spacing(0.5),
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: '8px',
  padding: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: EDITOR_Z_INDEX.formattingToolbar,
  ...theme.applyStyles('dark', { boxShadow: '0 2px 8px rgba(255,255,255,0.15)' }),
}));

export const ZoomToolbarSkeleton = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: EDITOR_LAYOUT.zoomToolbar.right,
  top: EDITOR_LAYOUT.zoomToolbar.top,
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: '8px',
  padding: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: EDITOR_Z_INDEX.canvasChrome,
  ...theme.applyStyles('dark', { boxShadow: '0 2px 8px rgba(255,255,255,0.15)' }),
}));

export const CanvasSkeleton = styled('div')({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
});

export const SideNodes = styled('div')(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  gap: theme.spacing(4),
  opacity: 0.2,
}));

export const LeftNodes = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginRight: theme.spacing(30),
}));

export const RightNodes = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginLeft: theme.spacing(30),
}));

export const SkeletonBlock = styled(Skeleton)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.11)',
  ...theme.applyStyles('dark', { backgroundColor: 'rgba(255, 255, 255, 0.11)' }),
}));

export const ToolbarActionSkeleton = styled(SkeletonBlock)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

export const ButtonSkeleton = styled(SkeletonBlock)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
}));

export const CentralNodeSkeleton = styled(SkeletonBlock)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  animation: 'pulse 1.5s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.3 },
    '50%': { opacity: 0.5 },
  },
}));
