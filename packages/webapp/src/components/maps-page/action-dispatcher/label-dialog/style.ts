/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import useClasses from '../../../../theme/useStyles';

export const useStyles = () =>
  useClasses({
    paper: {
      maxWidth: '420px',
    },
    title: {
      maxWidth: '100%',
      wordBreak: 'break-all',
    },
  });
