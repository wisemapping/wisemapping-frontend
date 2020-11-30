import React from 'react';
import { FormattedMessage, IntlProvider, injectIntl } from 'react-intl'

import Header from './Header.js';
import Footer from './Footer.js';

class RegistrationError extends React.Component {
  constructor(props) {
    super(props)
    // @Todo: This must be reviewed to be based on navigation state.
    // Login error example: http://localhost:8080/c/login?login.error=2
    const errorCode = new URLSearchParams(window.location.search).get('login_error');
    this.state = {
      errorCode: errorCode
    }
  }

  render() {

    let result;
    const errorCode = this.state.errorCode;
    if (errorCode) {
      if (errorCode === 3) {
        result = (
          <div class='error'>
            <FormattedMessage id="login.userinactive" defaultMessage="Sorry, your account has not been activated yet. You'll receive a notification login.email when it becomes active. Stay tuned!." />
          </div>)
      } else {
        result = (
          <div class='error'>
            <FormattedMessage id="login.error" defaultMessage="The login.email address or login.password you entered is  not valid." />
          </div>)
      }
    }
    return (<span>{result}</span>);
  }
}

class RegistrationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intl: props.intl
    }
  }

  render() {

    const intl = this.props.intl;
    return (
      <div class="wrapper">
        <div class="content">
          <h1><FormattedMessage id="registration.welcome" defaultMessage="Registration" /></h1>
          <p><FormattedMessage id="registration.loginto" defaultMessage="Log Into Your Account" /></p>

          <RegistrationError/>

          <form action="/c/perform-login" method="POST">
            <input type="email" name="username" placeholder={intl.formatMessage({ id: "login.email", defaultMessage: "Email" })} required="true" autocomplete="email" />
            <input type="password" name="password" placeholder={intl.formatMessage({ id: "login.password", defaultMessage: "Password" })} required="true" autocomplete="current-password" />

            <div>
              <input name="_spring_security_login.remberme" id="staySignIn" type="checkbox" />
              <label for="staySignIn"><FormattedMessage id="login.remberme" defaultMessage="Remember me" /></label>
            </div>
            <input type="submit" value={intl.formatMessage({ id: "login.signin", defaultMessage: "Sign In" })} />
          </form>
          <a href="/c/user/resetPassword"><FormattedMessage id="login.forgotpwd" defaultMessage="Forgot Password ?" /></a>
        </div>
      </div>
    );
  }
}

class RegistationApp extends React.Component {
  constructor(props) {
    super(props);

    const messages = props.messages;
    const locale = props.locale;

    this.state = {
      locale: locale,
      messages: messages
    };
  }

  render() {
    return (
      <IntlProvider locale={this.state.locale} defaultLocale='en' messages={this.state.messages}>
        <div>
          <Header type='none' />
          <RegistrationForm />
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}
RegistrationForm = injectIntl(RegistrationForm)

export default RegistationApp;

