import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import Client, { ErrorInfo } from '../../classes/client';

import Header from '../layout/header';
import Footer from '../layout/footer';

import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { activeInstance } from '../../redux/clientSlice';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import AppConfig from '../../classes/app-config';
import ReactGA from 'react-ga4';
import Separator from '../common/separator';
import GoogleButton from '../common/google-button';
import { Grid, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { recaptchaContainerStyle } from './style';

export type Model = {
  email: string;
  lastname: string;
  firstname: string;
  password: string;
  recaptcha: string;
};

const defaultModel: Model = { email: '', lastname: '', firstname: '', password: '', recaptcha: '' };

const RegistrationForm = () => {
  const [model, setModel] = useState<Model>(defaultModel);
  const [error, setError] = useState<ErrorInfo>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [captcha, setCaptcha] = useState<any>();
  const navigate = useNavigate();
  const intl = useIntl();

  const Client: Client = useSelector(activeInstance);
  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => Client.registerNewUser({ ...model }),
    {
      onSuccess: () => navigate('/c/registration-success'),
      onError: (error) => {
        setError(error);
        captcha.reset();
      },
    },
  );

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof Model]: value });
  };

  const maxFormWidth = 350;

  const handleRegisterWithGoogleClick = () => {
    const url = AppConfig.getGoogleOauth2Url();
    if (url) {
      window.location.href = url;
    } else {
      console.error('Auth callback url is null');
    }
  };

  return (
    <Grid container justifyContent="center">
      <Grid container spacing={0} justifyContent="center" alignItems="scretch" textAlign="center">
        <Grid item md={5} xs={12} justifyContent="center">
          <Typography variant="h4" component="h1">
            <FormattedMessage id="registration.title" defaultMessage="Become a member" />
          </Typography>

          <Typography paragraph>
            <FormattedMessage
              id="registration.desc"
              defaultMessage="Signing up is free and just take a moment "
            />
          </Typography>
          <GoogleButton
            text={intl.formatMessage({
              id: 'registration.google.button',
              defaultMessage: 'Sign up with Google',
            })}
            onClick={handleRegisterWithGoogleClick}
          />
        </Grid>
        <Grid item md={2} xs={12}>
          <Separator
            responsive={true}
            maxWidth={maxFormWidth}
            text={intl.formatMessage({
              id: 'registration.division',
              defaultMessage: 'or',
            })}
          />
        </Grid>
        <Grid item md={5} xs={12}>
          <FormControl css={{ maxWidth: maxFormWidth }}>
            <form onSubmit={handleOnSubmit}>
              <GlobalError error={error} />
              <Input
                name="email"
                type="email"
                onChange={handleOnChange}
                label={intl.formatMessage({
                  id: 'registration.email',
                  defaultMessage: 'Email',
                })}
                autoComplete="email"
                error={error}
              />
              <Input
                name="firstname"
                type="text"
                onChange={handleOnChange}
                label={intl.formatMessage({
                  id: 'registration.firstname',
                  defaultMessage: 'First Name',
                })}
                autoComplete="given-name"
                error={error}
              />
              <Input
                name="lastname"
                type="text"
                onChange={handleOnChange}
                label={intl.formatMessage({
                  id: 'registration.lastname',
                  defaultMessage: 'Last Name',
                })}
                autoComplete="family-name"
                error={error}
              />
              <Input
                name="password"
                type="password"
                onChange={handleOnChange}
                label={intl.formatMessage({
                  id: 'registration.password',
                  defaultMessage: 'Password',
                })}
                autoComplete="new-password"
                error={error}
                maxLength={30}
              />

              {AppConfig.isRecaptcha2Enabled() && (
                <>
                  {/* eslint-disable-next-line react/no-unknown-property */}
                  <div css={recaptchaContainerStyle}>
                    <ReCAPTCHA
                      ref={(el) => setCaptcha(el)}
                      sitekey={AppConfig.getRecaptcha2SiteKey()}
                      onChange={(value: string) => {
                        model.recaptcha = value;
                        setModel(model);
                      }}
                    />
                  </div>
                </>
              )}
              <div style={{ fontSize: '12px', padding: '10px 0px' }}>
                <FormattedMessage
                  id="registration.termandconditions"
                  defaultMessage="Terms of Client: Please check the WiseMapping Account information you've entered above, and review the Terms of Client here. By clicking on 'Register' below you are agreeing to the Terms of Client above and the Privacy Policy"
                />
              </div>
              <SubmitButton
                value={intl.formatMessage({
                  id: 'registration.register',
                  defaultMessage: 'Register',
                })}
              />
            </form>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item>
        <Link component={RouterLink} to="/c/login">
          <FormattedMessage id="header.haveaccount" defaultMessage="Already have an account?" />
        </Link>
      </Grid>
    </Grid>
  );
};

const RegistationPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registration.page-title',
      defaultMessage: 'Registration | WiseMapping',
    });
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'Registration:Init',
    });
  }, []);

  return (
    <div>
      <Header type="only-signin" />
      <RegistrationForm />
      <Footer />
    </div>
  );
};

export default RegistationPage;
