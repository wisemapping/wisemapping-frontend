import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles(() =>
    createStyles({
        textarea: {
            width: '100%',
            padding: '15px 15px',
            marging: '0px 10px',
        },
        textDesc: {
            width: '150px',
        },
    })
);
