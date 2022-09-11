import withStyles from '@mui/styles/withStyles';
import Alert from '@mui/material/Alert';

export const StyledAlert = withStyles({
  root: {
    padding: '10px 15px',
    margin: '5px 0px ',
  },
})(Alert);

export default StyledAlert;
