import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TableCell, withStyles } from "@material-ui/core";

export const StyledDialogContent = withStyles({
    root: {
        padding: '0px 39px'
    }
})(DialogContent);

export const StyledDialogTitle = withStyles({
    root: {
        padding: '39px 39px 10px 39px'
    }
})(DialogTitle);

export const StyledDialogActions = withStyles({
    root: {
        padding: '39px 39px 39px 39px'
    }
})(DialogActions);

export const ButtonStyled = withStyles({
    root: {
        textTransform: 'none',
        fontSize: '15px',
        fontWeight: 600,
        width: '196px',
        padding: '7px 64px 8px 64px',
        '&:hover': {
            border: '0'
        },
        borderRadius: '9px'
    },
    outlinedPrimary: {
        border: '0',
        background: '#ffa800',
        color: 'white',
        '&:hover': {
            border: '0',
            background: 'rgba(249, 168, 38, 0.91)'
        }
    },
    outlinedSecondary: {
        background: '#white',
        color: '#ffa800',
        border: '1px solid #ffa800',
        '&:hover': {
            border: '1px solid rgba(249, 168, 38, 0.91)',
            background: 'white'
        }
    }
})(Button)


export const StyledDialog = withStyles({
    root: {
        borderRadius: '9px'
    }
})(Dialog)
