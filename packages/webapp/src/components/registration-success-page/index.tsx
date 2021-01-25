import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { PageContent } from '../../theme';
import Header, { SignInButton } from '../layout/header'
import Footer from '../layout/footer'
import { Button, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom'


const RegistrationSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <PageContent>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="resetpassword.success.title" defaultMessage="Your account has been created successfully" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="registration.success.desc" defaultMessage="Click 'Sign In' button below and start creating mind maps." />
        </Typography>


        <Button color="primary" size="medium" variant="contained" component={RouterLink} to="/c/login" disableElevation={true}>
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>

      </PageContent>
      <Footer />
    </div>
  );
}

export default RegistrationSuccessPage;


