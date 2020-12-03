import './css/registration.css';

import React from 'react';
import { FormattedMessage, IntlProvider, injectIntl } from 'react-intl'
import ReCAPTCHA from "react-google-recaptcha";

import Header from './Header.js';
import Footer from './Footer.js';

const ErrorMessageDialog = (props) => {
  let result;

  const message = props.message;
  if (message) {
    const message = "here is a messar ofr error eerera rser wer"
    result = <p class='form-error-dialog'>{message}</p>
  } else {
    result = <span></span>
  }
  return result;
}


class RegistrationForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errorMsg: ""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleRecaptchaChange = this.handleRecaptchaChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleRecaptchaChange(value) {
    this.setState({ "recaptcha": value });
  }

  handleSubmit(event) {
    this.setState({ errorMsg: "Error Message" });
    event.preventDefault();
  }

  render() {
    const intl = this.props.intl;
    const errrMsg = this.state.errorMsg;

    return (
      <div class="wrapper">
        <div class="content">
          <h1><FormattedMessage id="registration.become" defaultMessage="Become a member of our comunity" /></h1>
          <p><FormattedMessage id="registration.signup" defaultMessage="Signing up is free and just take a moment " /></p>

          <ErrorMessageDialog message={errrMsg} />

          <form action="/" method="POST" onSubmit={this.handleSubmit}>
            <input type="email" name="username" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })} required="true" autoComplete="email" />
            <input type="text" name="firstname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })} required="true" autoComplete="given-name" />
            <input type="text" name="lastname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })} required="true" autoComplete="family-name" />
            <input type="password" name="password" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })} required="true" autoComplete="new-password" />
            <input type="password" name="retypePassword" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.retypepassword", defaultMessage: "Retype Password" })} required="true" autoComplete="new-password" />

            <div>
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={this.handleRecaptchaChange}
              />
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
}

const RegistationApp = props => {
  const messages = props.messages;
  const locale = props.locale;

  return (
    <IntlProvider locale={locale} defaultLocale='en' messages={messages}>
      <div>
        <Header type='only-signin' />
        <RegistrationForm />
        <Footer />
      </div>
    </IntlProvider>
  );
}

RegistrationForm = injectIntl(RegistrationForm)

export default RegistationApp;

