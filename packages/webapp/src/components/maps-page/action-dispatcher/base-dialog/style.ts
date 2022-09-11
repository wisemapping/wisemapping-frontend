import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import withStyles from '@mui/styles/withStyles';

export const StyledDialogContent = withStyles({
  root: {
    padding: '0px 39px',
  },
})(DialogContent);

export const StyledDialogTitle = withStyles({
  root: {
    padding: '39px 39px 10px 39px',
  },
})(DialogTitle);

export const StyledDialogActions = withStyles({
  root: {
    padding: '39px 39px 39px 39px',
  },
})(DialogActions);

export const StyledDialog = withStyles({
  root: {
    borderRadius: '9px',
  },
})(Dialog);
