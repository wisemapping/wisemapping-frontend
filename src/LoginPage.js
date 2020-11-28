import React from 'react';
import Header from './Header.js';
import Footer from './Footer.js';
import { createIntl, createIntlCache, FormattedMessage, IntlProvider } from 'react-intl'

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

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      staySignIn: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value
    });
  };

  handleSubmit(event) {
    // @todo: implements in the future ...
    // event.preventDefault();
  }

  render() {
    return (
      <div class="wrapper">
        <div class="content">
          <h1><FormattedMessage id="WELCOME" defaultMessage="Welcome" /></h1>
          <p><FormattedMessage id="LOG_INTO" defaultMessage="Log Into Your Account" /></p>

          <form onSubmit={this.handleSubmit} action="/c/j_spring_security_check" method="post">
            <input type="email" name="j_username" placeholder={intl.formatMessage({ id: "EMAIL", defaultMessage: 'Email' })} value={this.state.value} onChange={this.handleInputChange} required />
            <input type="password" name="j_password" placeholder={intl.formatMessage({ id: "PASSWORD", defaultMessage: 'Password' })} value={this.state.value} onChange={this.handleInputChange} required />

            <div>
              <input name="_spring_security_remember_me" id="staySignIn" type="checkbox" checked={this.state.staySignIn} onChange={this.handleInputChange} />
              <label for="_spring_security_remember_me"><FormattedMessage id="REMEMBER_ME" defaultMessage="Remember me" /></label>
            </div>

            <input type="submit" value={intl.formatMessage({ id: "SING_IN", defaultMessage: 'Sign In' })} />
          </form>
          <a href="resetPassword"><FormattedMessage id="FORGOT_PASSWORD" defaultMessage="Forgot Password ?" /></a>
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

