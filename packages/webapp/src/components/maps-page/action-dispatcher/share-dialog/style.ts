/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useTheme } from '@mui/material/styles';
import useClasses from '../../../../theme/useStyles';

export const useStyles = () =>
  useClasses({
    actionContainer: {
      padding: '10px 0px',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      borderRadius: '8px 8px 0px 0px',
      textAlign: 'center',
    },
    fullWidthInMobile: {
      [useTheme().breakpoints.down('sm')]: {
        minWidth: '99%',
        marginBottom: 5,
      },
    },
    email: {
      [useTheme().breakpoints.up('sm')]: {
        width: '300px',
      },
    },
    role: {
      [useTheme().breakpoints.up('sm')]: {
        margin: '0px 10px',
      },
    },
    textArea: {
      [useTheme().breakpoints.up('sm')]: {
        width: '730px',
        margin: '5px 0px',
        padding: '10px',
      },
    },
    listPaper: {
      maxHeight: 200,
      overflowY: 'scroll',
    },
    paper: {
      width: '850px',
      minWidth: '850px',
      [useTheme().breakpoints.down('sm')]: {
        minWidth: '100%',
      },
    },
    listItemText: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '& span': {
        display: 'inline',
      },
    },
  });
