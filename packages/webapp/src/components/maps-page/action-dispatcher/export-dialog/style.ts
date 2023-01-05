/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import useClasses from '../../../../theme/useStyles';

export const useStyles = () =>
  useClasses({
    select: {
      height: '40px',
      borderRadius: '9px',
      width: '300px',
      fontSize: '14px',
      margin: '0px 40px',
    },
    menu: {
      fontSize: '14px',
    },
    label: {
      margin: '5px 0px',
    },
  });
