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
import { alpha, useTheme } from '@mui/material/styles';

import useClasses from '../../../theme/useStyles';

export const useStyles = () => {
  const theme = useTheme();
  const smMediaQuery = theme.breakpoints.down('sm');

  return useClasses({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    cards: {
      display: 'none',
      [smMediaQuery]: {
        display: 'block',
      },
    },
    table: {
      [smMediaQuery]: {
        display: 'none',
      },
      minWidth: 750,
      '& tr:nth-of-type(2n)': {
        background: theme.palette.background.paper,
      },
      '& tr:nth-of-type(2n+1)': {
        background:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.action.hover, 0.08)
            : alpha(theme.palette.action.hover, 0.15),
      },
    },
    headerCell: {
      background: theme.palette.background.paper,
      fontWeight: 'bold',
      color: theme.palette.text.secondary,
      border: 0,
    },
    bodyCell: {
      border: '0px',
    },
    labelsCell: {
      maxWidth: '300px',
      overflow: 'hidden',
      textAlign: 'right',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    toolbar: {
      display: 'flex',
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: '0',
      marging: '0',
    },
    toolbarActions: {
      flexGrow: 1,
      paddingLeft: '23px;',
    },
    search: {
      borderRadius: 9,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      margin: '10px 0px',
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
      float: 'left',
      [smMediaQuery]: {
        width: '50%',
      },
    },
    tablePagination: {
      float: 'right',
      border: '0',
      paddingBottom: '5px',
      [smMediaQuery]: {
        width: '50%',
        overflow: 'hidden',
      },
    },
    searchIcon: {
      padding: '6px 0 0 5px',
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchInputRoot: {
      color: 'inherit',
    },
    toolbalLeft: {
      float: 'right',
    },
    searchInputInput: {
      '& .MuiInputBase-input': {
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 4,
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
          width: '12ch',
          '&:focus': {
            width: '20ch',
          },
        },
      },
    },
    cardHeader: {
      padding: '4px',
    },
    cardTitle: {
      maxWidth: '70vw',
    },
    // Skeleton styles
    skeletonBase: {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    skeletonTextLarge: {
      fontSize: '1rem',
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    skeletonTextSmall: {
      fontSize: '0.875rem',
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    cardSkeletonContainer: {
      maxWidth: '94vw',
      margin: '3vw',
    },
    // MapsPageLoading styles
    loadingContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
    },
    loadingDrawer: {
      width: 300,
      flexShrink: 0,
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    loadingDrawerLogo: {
      padding: '20px 0 20px 0',
    },
    loadingDrawerList: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    loadingDrawerFooter: {
      marginTop: 'auto',
      paddingTop: theme.spacing(2),
    },
    loadingMainContent: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    loadingAppBar: {
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    loadingSkeletonButton: {
      borderRadius: theme.spacing(0.5),
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    loadingSkeletonCircle: {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    loadingTableContainer: {
      marginTop: theme.spacing(10),
      marginBottom: theme.spacing(4),
    },
    loadingFooter: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      marginTop: 'auto',
      backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1e1e1e',
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    loadingFooterContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
    loadingFooterLinks: {
      display: 'flex',
      gap: theme.spacing(3),
    },
  });
};
