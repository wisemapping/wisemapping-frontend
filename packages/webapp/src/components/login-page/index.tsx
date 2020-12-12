import React, { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import {PageContent} from '../../theme/global-style';
import FormErrorDialog from '../form-error-dialog'


import Header from '../header'
import Footer from '../footer'
import SubmitButton from '../submit-button'


const ConfigStatusMessage = (props: any) => {
  const enabled = props.enabled
  let result = null;
  if (enabled === true) {
    result = (<div className="db-warn-msg">
      <p>
        <FormattedMessage id="login.hsqldbcofig" defaultMessage="Although HSQLDB is bundled with WiseMapping by default during the installation, we do not recommend this database for production use. Please consider using MySQL 5.7 instead. You can find more information how to configure MySQL" description="Missing production database configured" /><a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration"> here</a>
      </p>
    </div>);
  }
  return result;
}

const LoginError = () => {
  // @Todo: This must be reviewed to be based on navigation state.
  // Login error example: http://localhost:8080/c/login?login.error=2
  const errorCode = new URLSearchParams(window.location.search).get('login_error');
  const intl = useIntl();

  let msg = null;
  if (errorCode) {
    if (errorCode === "3") {
      msg = intl.formatMessage({ id: "login.userinactive", defaultMessage: "Sorry, your account has not been activated yet. You'll receive a notification login.email when it becomes active. Stay tuned!." });
    } else {
      msg = intl.formatMessage({ id: "login.error", defaultMessage: "The login.email address or login.password you entered is  not valid." });
    }
  }
  return <FormErrorDialog message={msg} />

}

const LoginPage = () => {
  const intl = useIntl();

  useEffect(() => {
    document.title = 'Login | WiseMapping';
  });

  return (
    <div>
      <Header type='only-signup' />

      <PageContent>
        <h1><FormattedMessage id="login.title" defaultMessage="Welcome" /></h1>
        <p><FormattedMessage id="login.desc" defaultMessage="Log Into Your Account" /></p>

        <LoginError />

        <form action="/c/perform-login" method="POST">
          <input type="email" name="username" placeholder={intl.formatMessage({ id: "login.email", defaultMessage: "Email" })} required={true} autoComplete="email" />
          <input type="password" name="password" placeholder={intl.formatMessage({ id: "login.password", defaultMessage: "Password" })} required={true} autoComplete="current-password" />

          <div>
            <input name="_spring_security_login.remberme" id="staySignIn" type="checkbox" />
            <label htmlFor="staySignIn"><FormattedMessage id="login.remberme" defaultMessage="Remember me" /></label>
          </div>
          <SubmitButton value={intl.formatMessage({ id: "login.signin", defaultMessage: "Sign In" })} />
        </form>
        <Link to="/c/forgot-password"><FormattedMessage id="login.forgotpwd" defaultMessage="Forgot Password ?" /></Link>

        <ConfigStatusMessage enabled='false' />

      </PageContent>

      <Footer />
    </div>
  );
}

export default LoginPage;

