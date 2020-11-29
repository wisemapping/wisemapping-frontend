import React from 'react';
import {FormattedMessage, IntlProvider,injectIntl } from 'react-intl'

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
          <FormattedMessage id="login.hsqldbcofig" defaultMessage="Warning: Although HSQLDB is bundled with WiseMapping by default during the installation, we do not recommend this database for production use. Please consider using MySQL 5.7 instead. You can find more information how to configure MySQL" description="Missing production database configured" /><a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration"> here</a>
        </p>
      </div>
    );
  }
}

class LoginError extends React.Component {
  constructor(props) {
    super(props)
    // @Todo: This must be reviewed to be based on navigation state.
    // Login error example: http://localhost:8080/c/login?login.error=2
    const errorCode = new URLSearchParams(window.location.search).get('login.error');
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

class LoginForm extends React.Component {
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
          <h1><FormattedMessage id="login.welcome" defaultMessage="login.welcome" /></h1>
          <p><FormattedMessage id="login.loginto" defaultMessage="Log Into Your Account" /></p>

          <LoginError />

          <form action="/c/perform-login" method="POST">
            <input type="email" name="username" placeholder={intl.formatMessage({ id: "login.email", defaultMessage: "login.email" })}  required="true" autocomplete="login.email" />
            <input type="password" name="login.password" placeholder={intl.formatMessage({ id: "login.password", defaultMessage: "login.password" })} required="true" autocomplete="current-login.password" />

            <div>
              <input name="_spring_security_login.remberme" id="staySignIn" type="checkbox" />
              <label for="staySignIn"><FormattedMessage id="login.remberme" defaultMessage="Remember me" /></label>
            </div>
            <input type="submit" value={intl.formatMessage({ id: "login.signin", defaultMessage: "Sign In" })} />
          </form>
          <a href="/c/user/resetlogin.password"><FormattedMessage id="login.forgotpwd" defaultMessage="Forgot login.password ?" /></a>
        </div>
      </div>
    );
  }
}

class LoginPage extends React.Component {
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
          <Header type='login' />
          <LoginForm />
          {/* <ConfigStatusMessage enabled='false' /> */}
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}
LoginForm = injectIntl(LoginForm) 

export default LoginPage;

