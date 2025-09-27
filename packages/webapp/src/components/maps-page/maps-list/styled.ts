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
  });
};
