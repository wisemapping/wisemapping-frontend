import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles(() =>
  createStyles({
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
  }),
);
