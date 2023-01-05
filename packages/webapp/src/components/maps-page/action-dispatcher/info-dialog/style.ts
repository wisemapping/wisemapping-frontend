/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useTheme } from '@mui/material/styles';
import useClasses from '../../../../theme/useStyles';

export const useStyles = () =>
  useClasses({
    textarea: {
      width: '100%',
      padding: '15px 15px',
      marging: '0px 10px',
    },
    textDesc: {
      width: '150px',
    },
    list: {
      '& li': {
        [useTheme().breakpoints.down('sm')]: {
          display: 'block',
        },
        '& p': {
          marginLeft: 5,
        },
      },
    },
  });
