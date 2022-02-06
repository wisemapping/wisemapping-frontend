import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles(() =>
    createStyles({
        actionContainer: {
            padding: '10px 0px',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '8px 8px 0px 0px',
            textAlign: 'center',
        },
        textArea: {
            width: '730px',
            margin: '5px 0px',
            padding: '10px',
        },
        listPaper: {
            maxHeight: 200,
            overflowY: 'scroll',
        },
        paper: {
            width: '850px',
            minWidth: '850px',
        },
    })
);
