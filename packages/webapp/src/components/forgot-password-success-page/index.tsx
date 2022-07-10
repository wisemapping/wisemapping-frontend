import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ReactGA from 'react-ga4';

const ForgotPasswordSuccessPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'forgotsuccess.page-title',
      defaultMessage: 'Password Recovered | WiseMapping',
    });
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'ForgotPassword:Success',
    });
  });

  return (
    <div>
      <Header type="none" />
      <FormContainer>
        <Typography variant="h4" component="h1">
          <FormattedMessage
            id="forgot.success.title"
            defaultMessage="Your temporal password has been sent."
          />
        </Typography>

        <Typography paragraph>
          <FormattedMessage
            id="forgot.success.desc"
            defaultMessage="We've sent you an email that will allow you to reset your password. You should receive it in the next minutes."
          />
        </Typography>

        <Button
          color="primary"
          size="medium"
          variant="contained"
          component={RouterLink}
          to="/c/login"
          disableElevation={true}
        >
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>
      </FormContainer>
      <Footer />
    </div>
  );
};

export default ForgotPasswordSuccessPage;
