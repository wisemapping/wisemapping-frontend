import React, { useState, } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import ReCAPTCHA from "react-google-recaptcha";
import { useHistory } from "react-router-dom";
import { Service, NewUser } from '../Services/service';


import Header from './Header';
import Footer from './Footer';

const css = require('../css/registration.css');

interface ErrorMessageDialogProps {
  message: string
}

const ErrorMessageDialog = (props: ErrorMessageDialogProps) => {
  let result;

  const message = props.message;
  if (message) {
    result = <p className='form-error-dialog'>{message}</p>
  } else {
    result = <span></span>
  }
  return result;
}

type RegistrationBody = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  recaptcha: string;
}
const RegistrationForm = (props: ServiceProps) => {
  const [email, setEmail] = useState(undefined);
  const [lastName, setLastname] = useState(undefined)
  const [firstName, setFirstname] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [recaptchaToken, setRecaptchaToken] = useState(undefined);
  const [errorMsg, setErrorMsg] = useState(undefined);

  const history = useHistory();
  const intl = useIntl();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const user: NewUser =
    {
      email: email,
      firstname: firstName,
      lastname: lastName,
      password: password,
      recaptcha: recaptchaToken
    };

    // Call Service ...
    props.service.registerNewUser(
      user,
      () => history.push("/c/user/registrationSuccess"),
      (msg) => setErrorMsg(msg)
    );
  }

  return (
    <div className="wrapper">
      <div className="content">
        <h1><FormattedMessage id="registration.become" defaultMessage="Become a member of our comunity" /></h1>
        <p><FormattedMessage id="registration.signup" defaultMessage="Signing up is free and just take a moment " /></p>

        <ErrorMessageDialog message={errorMsg} />

        <form action="/" method="POST" onSubmit={e => handleSubmit(e)}>
          <input type="email" name="email" onChange={e => setEmail(e.target.value)} placeholder={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })} required={true} autoComplete="email" />
          <input type="text" name="firstname" onChange={e => setFirstname(e.target.value)} placeholder={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })} required={true} autoComplete="given-name" />
          <input type="text" name="lastname" onChange={e => setLastname(e.target.value)} placeholder={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })} required={true} autoComplete="family-name" />
          <input type="password" name="password" onChange={e => setPassword(e.target.value)} placeholder={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })} required={true} autoComplete="new-password" />

          <div>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={setRecaptchaToken} />
          </div>
          <p>
            <FormattedMessage id="registration.termandconditions" defaultMessage="Terms of Service: Please check the WiseMapping Account information you've entered above, and review the Terms of Service here. By clicking on 'Register' below you are agreeing to the Terms of Service above and the Privacy Policy" />
          </p>

          <input type="submit" value={intl.formatMessage({ id: "registration.register", defaultMessage: "Register" })} />
        </form>
      </div>
    </div>
  );

}

type ServiceProps = {
  service: Service
}
const RegistationFormPage = (props: ServiceProps) => {
  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm service={props.service} />
      <Footer />
    </div>
  );
}

const RegistrationSuccessPage = (props: any) => {
  return (
    <div>
      <Header type='only-signup' />
      <div className="wrapper">
        <div className="content">
          <h1><FormattedMessage id="registration.success.title" defaultMessage="Your account has been created successfully" /></h1>
          <p><FormattedMessage id="registration.success.desc" defaultMessage="Your account has been created successfully, click to sign in and start enjoying  WiseMapping." /></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export { RegistationFormPage, RegistrationSuccessPage };


