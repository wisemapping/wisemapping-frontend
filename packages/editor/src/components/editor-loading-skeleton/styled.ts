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

import { useTheme } from '@mui/material/styles';

export const useEditorLoadingStyles = () => {
  const theme = useTheme();

  return {
    container: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column' as const,
      zIndex: 1000,
    },
    appBar: {
      height: 48,
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
    },
    appBarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    appBarCenter: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
    },
    appBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    rightToolbar: {
      position: 'absolute' as const,
      right: '7px',
      top: '150px',
      display: 'flex',
      flexDirection: 'column' as const,
      width: '40px',
      gap: theme.spacing(0.5),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.background.default,
      borderRadius: '8px',
      padding: theme.spacing(1),
      boxShadow: `0 2px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
      zIndex: 1100,
    },
    visualizationToolbar: {
      position: 'absolute' as const,
      right: '47px',
      top: 'calc(100% - 55px)',
      display: 'flex',
      gap: theme.spacing(1),
      alignItems: 'center',
      backgroundColor: theme.palette.background.default,
      borderRadius: '8px',
      padding: theme.spacing(1),
      boxShadow: `0 2px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
      zIndex: 1000,
    },
    canvas: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    centralNode: {
      borderRadius: theme.spacing(2),
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    sideNodes: {
      position: 'absolute' as const,
      display: 'flex',
      gap: theme.spacing(4),
      opacity: 0.2,
    },
    leftNodes: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: theme.spacing(2),
      marginRight: theme.spacing(30),
    },
    rightNodes: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: theme.spacing(2),
      marginLeft: theme.spacing(30),
    },
    skeletonBase: {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    skeletonButton: {
      borderRadius: theme.spacing(0.5),
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
  };
};
