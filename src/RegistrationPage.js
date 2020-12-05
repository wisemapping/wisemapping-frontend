import './css/registration.css';

import React from 'react';
import axios from 'axios';
import { FormattedMessage, injectIntl } from 'react-intl'
import { useHistory } from "react-router-dom";

import ReCAPTCHA from "react-google-recaptcha";

import Header from './Header.js';
import Footer from './Footer.js';


const ErrorMessageDialog = (props) => {
  let result;

  const message = props.message;
  if (message) {
    result = <p className='form-error-dialog'>{message}</p>
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
    this.setState({ [event.target.name]: event.target.value });
  }

  handleRecaptchaChange(value) {
    this.setState({ "recaptcha": value });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { errorMsg, ...rest } = this.state;

    await axios.post("http://localhost:8080/service/user",
      rest,
      { headers: { 'Content-Type': 'application/json' } }
    ).then(response => {
      const history = useHistory();
      history.push("/c/user/registrationSuccess");
    }).catch(error => {
      // Handle error ...
      const data = error.response.data;
      // const status = error.response.status;

      const errorMsg = Object.values(data.fieldErrors)[0];
      this.setState({ "errorMsg": errorMsg });
    });
  }

  render() {
    const intl = this.props.intl;
    const errrMsg = this.state.errorMsg;

    return (
      <div className="wrapper">
        <div className="content">
          <h1><FormattedMessage id="registration.become" defaultMessage="Become a member of our comunity" /></h1>
          <p><FormattedMessage id="registration.signup" defaultMessage="Signing up is free and just take a moment " /></p>

          <ErrorMessageDialog message={errrMsg} />

          <form action="/" method="POST" onSubmit={this.handleSubmit}>
            <input type="email" name="email" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })} required={true} autoComplete="email" />
            <input type="text" name="firstname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })} required={true} autoComplete="given-name" />
            <input type="text" name="lastname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })} required={true} autoComplete="family-name" />
            <input type="password" name="password" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })} required={true} autoComplete="new-password" />

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
RegistrationForm = injectIntl(RegistrationForm);

const RegistationFormPage = props => {
  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm />
      <Footer />
    </div>
  );
}

const RegistrationSuccessPage = (props) => {
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


