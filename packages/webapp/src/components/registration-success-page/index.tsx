import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';


const RegistrationSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <FormContainer>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="resetpassword.success.title" defaultMessage="Your account has been created successfully" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="registration.success.desc" defaultMessage="Click 'Sign In' button below and start creating mind maps." />
        </Typography>


        <Button color="primary" size="medium" variant="contained" component={RouterLink} to="/c/login" disableElevation={true}>
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>

      </FormContainer>
      <Footer />
    </div>
  );
}

export default RegistrationSuccessPage;


