import React, { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from "react-router-dom"
import { Service, ErrorInfo } from '../../services/Service'

import Header from '../layout/header'
import Footer from '../layout/footer'
import { PageContent } from '../../theme/global-style'
import { useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { activeInstance } from '../../reducers/serviceSlice'
import Input from '../form/input'
import GlobalError from '../form/global-error'

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<ErrorInfo>();
  const history = useHistory();
  const intl = useIntl();

  const service: Service = useSelector(activeInstance);
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
    <PageContent>
      <h1><FormattedMessage id="forgot.title" defaultMessage="Reset your password" /></h1>
      <p><FormattedMessage id="forgot.desc" defaultMessage="We will send you an email to reset your password" /></p>

      <GlobalError error={error} />

      <form onSubmit={handleOnSubmit}>
        <Input type="email" name="email" label={{ id: "forgot.email", defaultMessage: "Email" }}
          autoComplete="email" onChange={e => setEmail(e.target.value)} />

        <input type="submit" value={intl.formatMessage({ id: "forgot.register", defaultMessage: "Send recovery link" })} />
      </form>
    </PageContent>
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


