import withEmotionStyles from '../../HOCs/withEmotionStyles';
import Container from '@mui/material/Container';

const FormContainer = withEmotionStyles({
  padding: '20px 10px 0px 20px',
  maxWidth: '380px !important',
  textAlign: 'center',
})(Container);

export default FormContainer;
