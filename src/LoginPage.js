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
      <p>
        <FormattedMessage id="NO_PRODUCTION_DATABASE_CONFIGURED" defaultMessage="Missing production database configured" description="Missing production database configured" />
        <a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration"></a>.
      </p>
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
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <div class="wrapper">
        <div class="content">
          <h1><FormattedMessage id="WELCOME" defaultMessage="Welcome" /></h1>
          <p><FormattedMessage id="LOG_INTO" defaultMessage="Log Into Your Account" /></p>

          <form onSubmit={this.handleSubmit}>
            <div><input type="email" placeholder={intl.formatMessage({ id: "EMAIL", defaultMessage: 'Email' })} value={this.state.value} onChange={this.handleInputChange} required /></div>
            <div><input type="password" placeholder={intl.formatMessage({ id: "PASSWORD", defaultMessage: 'Password' })} value={this.state.value} onChange={this.handleInputChange} required /></div>

            <div>
              <input name="staySignIn" id="staySignIn" type="checkbox" checked={this.state.staySignIn} onChange={this.handleInputChange} />
              <label for="staySignIn"><FormattedMessage id="REMEMBER_ME" defaultMessage="Remember me" /></label>
            </div>

            <input type="submit" value={intl.formatMessage({ id: "SING_IN", defaultMessage: 'Sign In' })} value={this.state.value} />
          </form>
          <a hef="forgot"><FormattedMessage id="FORGOT_PASSWORD" defaultMessage="Forgot Password ?" /></a>
        </div>
      </div>
    );
  }
}

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
          <ConfigStatusMessage enabled='true' />
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}
export default LoginPage;

