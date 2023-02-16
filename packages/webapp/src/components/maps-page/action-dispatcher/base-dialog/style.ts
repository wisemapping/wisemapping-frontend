import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import withEmotionStyles from '../../../HOCs/withEmotionStyles';

export const StyledDialogContent = withEmotionStyles({
  padding: '0px 39px',
})(DialogContent);

export const StyledDialogTitle = withEmotionStyles({
  padding: '39px 39px 10px 39px',
})(DialogTitle);

export const StyledDialogActions = withEmotionStyles({
  padding: '39px 39px 39px 39px',
})(DialogActions);

export const StyledDialog = withEmotionStyles({
  borderRadius: '9px',
})(Dialog);
