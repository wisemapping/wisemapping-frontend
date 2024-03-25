import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import Separator from '../common/separator';
import GoogleButton from '../common/google-button';
import AppConfig from '../../classes/app-config';
import { useMutation } from 'react-query';
import { ErrorInfo, LoginErrorInfo } from '../../classes/client';
import { ClientContext } from '../../classes/provider/client-context';

export type Model = {
  email: string;
  password: string;
};

export type LoginErrorProps = {
  errorCode: number | undefined;
};

const defaultModel: Model = { email: '', password: '' };

const LoginError = ({ errorCode }: LoginErrorProps) => {
  const intl = useIntl();

  let msg: null | string = null;
  if (errorCode) {
    switch (errorCode) {
      case 1:
        msg = intl.formatMessage({
          id: 'login.unexpected-error',
          defaultMessage: 'Unexpected error during login. Please, try latter.',
        });
        break;
      case 2:
        msg = intl.formatMessage({
          id: 'login.userinactive',
          defaultMessage:
            "Sorry, your account has not been activated yet. You'll receive a notification email when it becomes active. Stay tuned!.",
        });
        break;
      default:
        msg = intl.formatMessage({
          id: 'login.error',
          defaultMessage: 'The email address or password you entered is not valid.',
        });
    }
  }
  return msg ? <GlobalError error={{ msg: msg }} /> : null;
};

const LoginPage = (): React.ReactElement => {
  const intl = useIntl();
  const [model, setModel] = useState<Model>(defaultModel);
  const [loginError, setLoginError] = useState<number | undefined>(undefined);

  const client = useContext(ClientContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'login.page-title',
      defaultMessage: 'Login | WiseMapping',
    });
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: 'Login' });
  }, []);

  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => client.login({ ...model }),
    {
      onSuccess: () => navigate('/c/maps/'),
      onError: (error: LoginErrorInfo) => {
        setLoginError(error.code);
      },
    },
  );

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    mutation.mutate(model);
    event.preventDefault();
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof Model]: value });
  };

  return (
    <div>
      <Header type={AppConfig.isRegistrationEnabled() ? 'only-signup' : 'none'} />

      <FormContainer>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="login.title" defaultMessage="Welcome" />
        </Typography>

        <Typography paragraph>
          <FormattedMessage id="login.desc" defaultMessage="Log into your account" />
        </Typography>

        <LoginError errorCode={loginError} />

        <FormControl>
          <form onSubmit={handleOnSubmit}>
            <Input
              onChange={handleOnChange}
              name="email"
              type="email"
              label={intl.formatMessage({
                id: 'login.email',
                defaultMessage: 'Email',
              })}
              required
              autoComplete="email"
            />
            <Input
              onChange={handleOnChange}
              name="password"
              type="password"
              label={intl.formatMessage({
                id: 'login.password',
                defaultMessage: 'Password',
              })}
              required
              autoComplete="current-password"
            />
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
        {AppConfig.isRegistrationEnabled() && (
          <>
            <Separator
              responsive={false}
              text={intl.formatMessage({
                id: 'login.division',
                defaultMessage: 'or',
              })}
            />
            <GoogleButton
              text={intl.formatMessage({
                id: 'login.google.button',
                defaultMessage: 'Sign in with Google',
              })}
              onClick={() => {
                const authUrl = AppConfig.getGoogleOauth2Url();
                if (authUrl) {
                  window.location.href = authUrl;
                } else {
                  console.log('GoogleOauth2Url is not configured.');
                }
              }}
            />
          </>
        )}
      </FormContainer>

      <Footer />
    </div>
  );
};

export default LoginPage;
