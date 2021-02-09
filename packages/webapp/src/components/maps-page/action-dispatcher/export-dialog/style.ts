import { createStyles, makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        select: {
            height: '40px',
            borderRadius: '9px',
            width: '300px',
            fontSize: '14px',
            // margin: '0px 30px' 
        },
        menu: {
            fontSize: '14px'
        },
        label: {
            margin: '5px 0px'
        }

    })
);