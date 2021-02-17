import createStyles from "@material-ui/core/styles/createStyles";
import makeStyles from "@material-ui/core/styles/makeStyles";

export const useStyles = makeStyles(() =>
    createStyles({
        textarea: {
            width: '100%',
            padding: '15px 15px',
            marging: '0px 10px'
        }
    }),
);