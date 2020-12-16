import React, { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import ReCAPTCHA from 'react-google-recaptcha'
import { useHistory } from "react-router-dom"
import { Service, NewUser, ErrorInfo } from '../../services/Service'
import FormErrorDialog from '../form-error-dialog'

import Header from '../header'
import Footer from '../footer'
import SubmitButton from '../submit-button'

import { StyledReCAPTCHA } from './styled';
import { PageContent } from '../../theme/global-style';

const RegistrationForm = (props: ServiceProps) => {
  const [email, setEmail] = useState('');
  const [lastname, setLastname] = useState('')
  const [firstname, setFirstname] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>('');
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const [disableButton, setDisableButton] = useState(false);

  const history = useHistory();
  const intl = useIntl();


  const handleOnSubmit = (event: React.FormEvent<any>): void => {
    event.preventDefault();
    setDisableButton(true);

    const user: NewUser =
    {
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password,
      recaptcha: String(recaptchaToken)
    };

    // Call Service ...
    const service = props.service;
    service.registerNewUser(user)
      .then(() => {
        history.push("/c/registration-success")
      }).catch((error: ErrorInfo) => {
        const errorMsg = error.msg ? error.msg : undefined;
        setErrorMsg(errorMsg);
        setDisableButton(false);
      });
  }



  return (
    <PageContent>
      <h1><FormattedMessage id="registration.title" defaultMessage="Become a member of our comunity" /></h1>
      <p><FormattedMessage id="registration.desc" defaultMessage="Signing up is free and just take a moment " /></p>

      <form onSubmit={handleOnSubmit}>
        <input type="email" name="email" onChange={e => setEmail(e.target.value)} placeholder={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })} required={true} autoComplete="email" />
        <input type="text" name="firstname" onChange={e => setFirstname(e.target.value)} placeholder={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })} required={true} autoComplete="given-name" />
        <input type="text" name="lastname" onChange={e => setLastname(e.target.value)} placeholder={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })} required={true} autoComplete="family-name" />
        <input type="password" name="password" onChange={e => setPassword(e.target.value)} placeholder={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })} required={true} autoComplete="new-password" />

        <StyledReCAPTCHA>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={setRecaptchaToken} />
        </StyledReCAPTCHA>

        <FormErrorDialog message={errorMsg} />

        <div style={{ width: "300px", textAlign: "center", fontSize: "13px", margin: "auto" }}>
          <FormattedMessage id="registration.termandconditions" defaultMessage="Terms of Service: Please check the WiseMapping Account information you've entered above, and review the Terms of Service here. By clicking on 'Register' below you are agreeing to the Terms of Service above and the Privacy Policy" />
        </div>

        <SubmitButton disabled={disableButton} value={intl.formatMessage({ id: "registration.register", defaultMessage: "Register" })} />
      </form>
    </PageContent >
  );
}

type ServiceProps = {
  service: Service
}
const RegistationPage = (props: ServiceProps) => {

  useEffect(() => {
    document.title = 'Registration | WiseMapping';
  });

  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm service={props.service} />
      <Footer />
    </div>
  );
}

export default RegistationPage;


