import React, { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import Client, { ErrorInfo } from '../../client'

import Header from '../layout/header'
import Footer from '../layout/footer'
import FormContainer from '../layout/form-container';
import { useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { activeInstance } from '../../reducers/serviceSlice'
import Input from '../form/input'
import GlobalError from '../form/global-error'
import SubmitButton from '../form/submit-button'
import { Typography } from '@material-ui/core'

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<ErrorInfo>();
  const history = useHistory();
  const intl = useIntl();

  const service: Client = useSelector(activeInstance);
  const mutation = useMutation<void, ErrorInfo, string>(
    (email: string) => service.resetPassword(email),
    {
      onSuccess: () => history.push("/c/forgot-password-success"),
      onError: (error) => {
        setError(error);
      }
    }
  );

  const handleOnSubmit = (event: React.FormEvent<any>) => {
    event.preventDefault();
    mutation.mutate(email);
  }

  return (
    <FormContainer>
      <Typography variant="h4" component="h1">
        <FormattedMessage id="forgot.title" defaultMessage="Reset your password" />
      </Typography>

      <Typography>
        <FormattedMessage id="forgot.desc" defaultMessage="We will send you an email to reset your password" />
      </Typography>

      <GlobalError error={error} />

      <form onSubmit={handleOnSubmit}>
        <Input type="email" name="email" label={{ id: "forgot.email", defaultMessage: "Email" }}
          autoComplete="email" onChange={e => setEmail(e.target.value)} />

        <SubmitButton value={intl.formatMessage({ id: "forgot.register", defaultMessage: "Send recovery link" })} />
      </form>
    </FormContainer>
  );
}

const ForgotPasswordPage = () => {

  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='only-signin' />
      <ForgotPassword />
      <Footer />
    </div>
  );
}

export { ForgotPasswordPage }


