import React, { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from "react-router-dom"
import { Service } from '../../services/Service'

import { PageContent } from '../../theme/global-style';



import Header from '../header'
import Footer from '../footer'
import SubmitButton from '../submit-button'

interface ErrorMessageDialogProps {
  message: string
}

const ErrorMessageDialog = (props: ErrorMessageDialogProps) => {
  const message = props.message;
  return message ? <p className='form-error-dialog'>{message}</p> : <span></span>;
}

type ForgotPasswordProps = {
  email: string;
}

const RegistrationForm = (props: ServiceProps) => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [disableButton, setDisableButton] = useState(false);

  const history = useHistory();
  const intl = useIntl();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDisableButton(true);


    // Call Service ...
    props.service.resetPassword(
      email,
      () => history.push("/c/user/forgotPasswordSuccess"),
      (msg) => { setErrorMsg(msg); setDisableButton(false); }
    );
  }

  return (
    <PageContent>
      <h1><FormattedMessage id="forgot.title" defaultMessage="Reset your password" /></h1>
      <p><FormattedMessage id="forgot.desc" defaultMessage="We will send you an email to reset your password" /></p>

      <form method="POST" onSubmit={e => handleSubmit(e)}>
        <input type="email" name="email" onChange={e => setEmail(e.target.value)} placeholder={intl.formatMessage({ id: "forgot.email", defaultMessage: "Email" })} required={true} autoComplete="email" />

        <ErrorMessageDialog message={errorMsg} />

        <SubmitButton disabled={disableButton} value={intl.formatMessage({ id: "forgot.register", defaultMessage: "Send recovery link" })} />
      </form>
    </PageContent>
  );
}

type ServiceProps = {
  service: Service
}
const ForgotPasswordPage = (props: ServiceProps) => {

  useEffect(() => {
    document.title = 'Forgot Password | WiseMapping';
  });

  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm service={props.service} />
      <Footer />
    </div>
  );
}

export { ForgotPasswordPage }


