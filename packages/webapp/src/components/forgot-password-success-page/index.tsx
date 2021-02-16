import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import FormContainer from '../layout/form-container';
import Header from '../layout/header'
import Footer from '../layout/footer'
import { Link as RouterLink} from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';


const ForgotPasswordSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <FormContainer>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="forgot.success.title" defaultMessage="Your temporal password has been sent" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="forgot.success.desc" defaultMessage="We've sent you an email that will allow you to reset your password. Please check your email now." />
        </Typography>

        <Button color="primary" size="medium" variant="contained" component={RouterLink} to="/c/login" disableElevation={true}>
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>

      </FormContainer>
      <Footer />
    </div>
  );
}

export default ForgotPasswordSuccessPage


