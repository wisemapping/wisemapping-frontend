import React from 'react';
import { createIntl, createIntlCache, FormattedMessage, IntlProvider } from 'react-intl'

import Header from './Header.js';
import Footer from './Footer.js';

class ConfigStatusMessage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      enabled: props.enabled
    }
  }

  render() {
    return (
      <div class="db-warn-msg">
        <p>
          <FormattedMessage id="NO_PRODUCTION_DATABASE_CONFIGURED" defaultMessage="Warning: Although HSQLDB is bundled with WiseMapping by default during the installation, we do not recommend this database for production use. Please consider using MySQL 5.7 instead. You can find more information how to configure MySQL" description="Missing production database configured" /><a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration"> here</a>
        </p>
      </div>
    );
  }
}

class LoginError extends React.Component {
  constructor(props) {
    super(props)
    // @Todo: This must be reviewed to be based on navigation state.
    // Login error example: http://localhost:8080/c/login?login_error=2
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
            <FormattedMessage id="USER_INACTIVE" defaultMessage="Sorry, your account has not been activated yet. You'll receive a notification email when it becomes active. Stay tuned!." />
          </div>)
      } else {
        result = (
          <div class='error'>
            <FormattedMessage id="LOGIN_ERROR" defaultMessage="The email address or password you entered is  not valid." />
          </div>)
      }
    }
    return (<span>{result}</span>);
  }
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      staySignIn: false
    };
  }

  render() {
    return (
      <div class="wrapper">
        <div class="content">
          <h1><FormattedMessage id="WELCOME" defaultMessage="Welcome" /></h1>
          <p><FormattedMessage id="LOG_INTO" defaultMessage="Log Into Your Account" /></p>

          <LoginError />

          <form action="/c/perform-login" method="POST">
            <input type="email" name="username" placeholder={intl.formatMessage({ id: "EMAIL", defaultMessage: 'Email' })} value={this.state.value} required="true" autocomplete="email" />
            <input type="password" name="password" placeholder={intl.formatMessage({ id: "PASSWORD", defaultMessage: 'Password' })} value={this.state.value} required="true" autocomplete="current-password" />

            <div>
              <input name="_spring_security_remember_me" id="staySignIn" type="checkbox" />
              <label for="staySignIn"><FormattedMessage id="REMEMBER_ME" defaultMessage="Remember me" /></label>
            </div>
            <input type="submit" value={intl.formatMessage({ id: "SING_IN", defaultMessage: 'Sign In' })} />
          </form>
          <a href="/c/user/resetPassword"><FormattedMessage id="FORGOT_PASSWORD" defaultMessage="Forgot Password ?" /></a>
        </div>
      </div>
    );
  }
}

// Internationalize setup ....
const cache = createIntlCache()

// @Todo: Review ...
var intl = null;

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    const messages = props.messages;
    const locale = props.locale;

    this.state = {
      locale: locale,
      message: messages
    };

    intl = createIntl(
      {
        locale: locale,
        defaultLocale: 'en'
      },
      messages,
      cache
    )
  }

  render() {
    return (
      <IntlProvider locale={this.state.locale} defaultLocale="en" messages={this.state.messages}>
        <div>
          <Header type='login' />
          <LoginForm />
          {/* <ConfigStatusMessage enabled='true' /> */}
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}
export default LoginPage;

