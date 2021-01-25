import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { PageContent } from '../../theme';
import Header, { SignInButton } from '../layout/header'
import Footer from '../layout/footer'
import { Button, Typography } from '@material-ui/core';
import { Link as RouterLink} from 'react-router-dom'


const ForgotPasswordSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <PageContent>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="forgot.success.title" defaultMessage="Your temporal password has been sent" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="forgot.success.desc" defaultMessage="We've sent you an email that will allow you to reset your password. Please check your email now." />
        </Typography>

        <Button color="primary" size="medium" variant="contained" component={RouterLink} to="/c/login" disableElevation={true}>
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>

      </PageContent>
      <Footer />
    </div>
  );
}

export default ForgotPasswordSuccessPage


