import React, { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { PageContent } from '../../theme/global-style';
import Header from '../layout/header'
import Footer from '../layout/footer'
import SubmitButton from '../form/submit-button'
import Input from '../form/input';
import GlobalError from '../form/global-error';


const ConfigStatusMessage = (props: any) => {
  const enabled = props.enabled
  let result;
  if (enabled === true) {
    result = (<div className="db-warn-msg">
      <p>
        <FormattedMessage id="login.hsqldbcofig" defaultMessage="Although HSQLDB is bundled with WiseMapping by default during the installation, we do not recommend this database for production use. Please consider using MySQL 5.7 instead. You can find more information how to configure MySQL" description="Missing production database configured" /><a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration"> here</a>
      </p>
    </div>);
  }
  return result ? result : null;
}

const LoginError = () => {
  // @Todo: This must be reviewed to be based on navigation state.
  // Login error example: http://localhost:8080/c/login?login.error=2
  const errorCode = new URLSearchParams(window.location.search).get('login_error');
  const intl = useIntl();

  let msg;
  if (errorCode) {
    if (errorCode === "3") {
      msg = intl.formatMessage({ id: "login.userinactive", defaultMessage: "Sorry, your account has not been activated yet. You'll receive a notification email when it becomes active. Stay tuned!." });
    } else {
      msg = intl.formatMessage({ id: "login.error", defaultMessage: "The email address or password you entered is  not valid." });
    }
  }
  <GlobalError error={{msg: msg}} />
  return null;
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
        <p><FormattedMessage id="login.desc" defaultMessage="Log into your account" /></p>

        <LoginError />

        <form action="/c/perform-login" method="POST">
          <Input name="email" type="email" label={{ id: "login.email", defaultMessage: "Email" }} required={true} autoComplete="email" />
          <Input name="password" type="password" label={{ id: "login.password", defaultMessage: "Password" }} required={true} autoComplete="current-password" />

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

