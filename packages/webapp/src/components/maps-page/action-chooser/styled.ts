import MenuItem from '@mui/material/MenuItem';
import withEmotionStyles from '../../HOCs/withEmotionStyles';

export const StyledMenuItem = withEmotionStyles({
  root: {
    width: '300px',
  },
})(MenuItem);
