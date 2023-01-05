import withEmotionStyles from '../../HOCs/withEmotionStyles';
import Alert from '@mui/material/Alert';

export const StyledAlert = withEmotionStyles({
  padding: '10px 15px',
  margin: '5px 0px ',
})(Alert);

export default StyledAlert;
