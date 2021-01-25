import { Dialog, DialogActions, DialogContent, DialogTitle, withStyles } from "@material-ui/core";

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

export const StyledDialog = withStyles({
    root: {
        borderRadius: '9px'
    }
})(Dialog)
