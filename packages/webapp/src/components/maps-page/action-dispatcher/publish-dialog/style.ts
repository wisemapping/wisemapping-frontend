import { createStyles, makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        textarea: {
            width: '100%',
            padding: '15px 15px',
            marging: '0px 10px'
        }
    }),
);