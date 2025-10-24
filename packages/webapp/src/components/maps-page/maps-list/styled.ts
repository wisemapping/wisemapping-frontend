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
      marginTop: '30px',
      marginBottom: theme.spacing(2),
      backgroundColor: 'transparent',
      marginLeft: '96px',
      marginRight: '96px',
      [smMediaQuery]: {
        marginTop: '0px',
        marginLeft: '0px',
        marginRight: '0px',
      },
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
      backgroundColor: theme.palette.background.default,
      '& tbody tr': {
        background: 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.action.hover, 0.04)
              : alpha(theme.palette.action.hover, 0.08),
        },
      },
    },
    headerCell: {
      background: theme.palette.background.default,
      fontWeight: 'bold',
      color: theme.palette.text.secondary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderTop: 0,
      borderLeft: 0,
      borderRight: 0,
      fontSize: '0.96rem',
      fontFamily: theme.typography.fontFamily,
      padding: '8px 12px',
    },
    bodyCell: {
      fontSize: '0.96rem',
      fontFamily: theme.typography.fontFamily,
      padding: '8px 12px',
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
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
      paddingTop: '30px',
      paddingBottom: '30px',
      marging: '0',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      [smMediaQuery]: {
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    tableContainer: {
      backgroundColor: theme.palette.background.default,
      border: '1px solid rgba(128, 128, 128, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
      [smMediaQuery]: {
        border: 'none',
        borderRadius: '0',
      },
    },
    toolbarActions: {
      flex: '1 1 0',
      minWidth: 0,
      '& .MuiButton-root': {
        [smMediaQuery]: {
          minWidth: 'auto',
          padding: '6px 8px',
          '& .MuiButton-startIcon': {
            margin: 0,
          },
        },
      },
      '& .button-text': {
        [smMediaQuery]: {
          display: 'none',
        },
      },
    },
    searchContainer: {
      flex: '1 1 0',
      display: 'flex',
      justifyContent: 'center',
      minWidth: 0,
      [smMediaQuery]: {
        display: 'none',
      },
    },
    search: {
      borderRadius: 9,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      margin: '10px 0px',
      width: 'auto',
    },
    paginationDesktop: {
      display: 'block',
      backgroundColor: 'transparent',
      [smMediaQuery]: {
        display: 'none',
      },
    },
    paginationMobile: {
      display: 'none',
      backgroundColor: 'transparent',
      [smMediaQuery]: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '16px',
        marginLeft: '16px',
        marginRight: '16px',
        backgroundColor: 'transparent',
      },
    },
    tablePagination: {
      width: 'auto',
      display: 'inline-flex',
      backgroundColor: 'transparent',
      border: '1px solid rgba(128, 128, 128, 0.15)',
      borderRadius: '8px',
      padding: '0',
      margin: '0',
      '& .MuiTablePagination-toolbar': {
        minHeight: '40px',
        paddingLeft: '22px',
        paddingRight: '12px',
        minWidth: 'auto',
        backgroundColor: 'transparent',
      },
      '& .MuiTablePagination-spacer': {
        display: 'none',
      },
      '& .MuiTablePagination-selectLabel': {
        margin: 0,
      },
      '& .MuiTablePagination-displayedRows': {
        margin: 0,
      },
      [smMediaQuery]: {
        width: '50%',
        overflow: 'hidden',
        marginRight: '0',
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
          width: '24ch',
          '&:focus': {
            width: '39ch',
          },
        },
      },
    },
    cardHeader: {
      padding: '4px',
    },
    cardTitle: {
      maxWidth: '70vw',
      fontSize: '0.875rem',
      fontFamily: theme.typography.fontFamily,
    },
    // Skeleton styles
    skeletonBase: {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    skeletonDrawer: {
      backgroundColor:
        theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.11)',
    },
    skeletonTextLarge: {
      fontSize: '0.96rem',
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.11)',
    },
    skeletonTextSmall: {
      fontSize: '0.96rem',
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
      width: 240,
      flexShrink: 0,
      background:
        theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.grey[900],
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
      marginLeft: '96px',
      marginRight: '96px',
      padding: '0 !important',
    },
    loadingSearchToolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
      paddingTop: '30px',
      paddingBottom: '30px',
      margin: '0',
      boxShadow: 'none',
      backgroundColor: theme.palette.background.default,
    },
    loadingToolbarLeft: {
      flex: '1 1 0',
      paddingLeft: '23px',
      minWidth: 0,
    },
    loadingToolbarCenter: {
      flex: '1 1 0',
      display: 'flex',
      justifyContent: 'center',
      minWidth: 0,
    },
    loadingToolbarRight: {
      flex: '1 1 0',
      display: 'flex',
      justifyContent: 'flex-end',
      minWidth: 0,
    },
  });
};
