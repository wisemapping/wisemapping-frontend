import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import Header from '../layout/header';
import Footer from '../layout/footer';
import SubmitButton from '../form/submit-button';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import FormContainer from '../layout/form-container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import ReactGA from 'react-ga4';
import { getCsrfToken, getCsrfTokenParameter } from '../../utils';

type ConfigStatusProps = {
  enabled?: boolean;
};

const ConfigStatusMessage = ({ enabled = false }: ConfigStatusProps): React.ReactElement => {
  let result;
  if (enabled === true) {
    result = (
      <div className="db-warn-msg">
        <p>
          <FormattedMessage
            id="login.hsqldbcofig"
            defaultMessage="Although HSQLDB is bundled with WiseMapping by default during the installation, we do not recommend this database for production use. Please consider using MySQL 5.7 instead. You can find more information how to configure MySQL"
            description="Missing production database configured"
          />
          <a href="https://wisemapping.atlassian.net/wiki/display/WS/Database+Configuration">
            {' '}
            here
          </a>
        </p>
      </div>
    );
  }
  return result || null;
};

const LoginError = () => {
  // @Todo: This must be reviewed to be based on navigation state.
  // Login error example: http://localhost:8080/c/login?login.error=2
  const errorCode = new URLSearchParams(window.location.search).get('login_error');
  const intl = useIntl();

  let msg: null | string = null;
  if (errorCode) {
    switch (errorCode) {
      case '3':
        msg = intl.formatMessage({
          id: 'login.userinactive',
          defaultMessage:
            "Sorry, your account has not been activated yet. You'll receive a notification email when it becomes active. Stay tuned!.",
        });
        break;
      default:
        msg = intl.formatMessage({
          id: 'login.error',
          defaultMessage: 'The email address or password you entered is  not valid.',
        });
    }
  }
  return msg ? <GlobalError error={{ msg: msg }} /> : null;
};

const LoginPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'login.page-title',
      defaultMessage: 'Login | WiseMapping',
    });
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: 'Login' });
  }, []);

  return (
    <div>
      <Header type="only-signup" />

      <FormContainer maxWidth="xs">
        <Typography variant="h4" component="h1">
          <FormattedMessage id="login.title" defaultMessage="Welcome" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="login.desc" defaultMessage="Log into your account" />
        </Typography>

        <LoginError />

        <FormControl>
          <form action="/c/perform-login" method="POST">
            <input type="hidden" value={getCsrfToken()} name={getCsrfTokenParameter()} />
            <Input
              name="username"
              type="email"
              label={intl.formatMessage({
                id: 'login.email',
                defaultMessage: 'Email',
              })}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label={intl.formatMessage({
                id: 'login.password',
                defaultMessage: 'Password',
              })}
              required
              autoComplete="current-password"
            />
            <div>
              <input name="remember-me" id="remember-me" type="checkbox" />
              <label htmlFor="remember-me">
                <FormattedMessage id="login.remberme" defaultMessage="Remember me" />
              </label>
            </div>
            <SubmitButton
              value={intl.formatMessage({
                id: 'login.signin',
                defaultMessage: 'Sign In',
              })}
            />
          </form>
        </FormControl>

        <Link component={RouterLink} to="/c/forgot-password">
          <FormattedMessage id="login.forgotpwd" defaultMessage="Forgot Password ?" />
        </Link>
        <ConfigStatusMessage />
      </FormContainer>

      <Footer />
    </div>
  );
};

export default LoginPage;
