import React, { useState, useEffect, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ErrorInfo, ForgotPasswordResult } from '../../classes/client';

import Header from '../layout/header';
import Footer from '../layout/footer';
import FormContainer from '../layout/form-container';
import { useMutation } from 'react-query';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import ReactGA from 'react-ga4';
import { Link as RouterLink } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { ClientContext } from '../../classes/provider/client-context';
import Button from '@mui/material/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<ErrorInfo>();
  const [showOauthMessage, setShowOauthMessage] = useState<boolean>(false);
  const navigate = useNavigate();
  const intl = useIntl();

  const client = useContext(ClientContext);
  const mutation = useMutation<ForgotPasswordResult, ErrorInfo, string>(
    (email: string) => client.resetPassword(email),
    {
      onSuccess: (result) => {
        if (result.action === 'EMAIL_SENT') navigate('/c/forgot-password-success');
        if (result.action === 'OAUTH2_USER') setShowOauthMessage(true);
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(email);
  };

  if (showOauthMessage) {
    return (
      <FormContainer>
        <Typography>
          <FormattedMessage
            id="forgot.oauth.message"
            defaultMessage="You dont need password, please login using Google."
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
          <FormattedMessage id="forgot.oauth.back" defaultMessage="Back to login" />
        </Button>
      </FormContainer>
    );
  }

  return (
    <FormContainer maxWidth="xs">
      <Typography variant="h4" component="h1">
        <FormattedMessage id="forgot.title" defaultMessage="Reset your password" />
      </Typography>

      <Typography>
        <FormattedMessage
          id="forgot.desc"
          defaultMessage="We will send you an email to reset your password."
        />
      </Typography>

      <GlobalError error={error} />

      <form onSubmit={handleOnSubmit}>
        <Input
          type="email"
          name="email"
          label={intl.formatMessage({ id: 'forgot.email', defaultMessage: 'Email' })}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />

        <SubmitButton
          value={intl.formatMessage({
            id: 'forgot.register',
            defaultMessage: 'Send recovery link',
          })}
        />
      </form>
    </FormContainer>
  );
};

const ForgotPasswordPage = (): React.ReactElement => {
  const intl = useIntl();
  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'forgot.page-title',
      defaultMessage: 'Forgot Password | WiseMapping',
    });
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'ForgotPassword:Init',
    });
  }, []);

  return (
    <div>
      <Header type="only-signin" />
      <ForgotPassword />
      <Footer />
    </div>
  );
};

export { ForgotPasswordPage };
