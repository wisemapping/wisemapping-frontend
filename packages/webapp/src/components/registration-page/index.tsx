/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { useState, useEffect, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router';
import { ErrorInfo } from '../../classes/client';

import AccountAccessLayout from '../layout/AccountAccessLayout';

import { useMutation } from 'react-query';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import AppConfig from '../../classes/app-config';
import { trackPageView } from '../../utils/analytics';
import Separator from '../common/separator';
import GoogleButton from '../common/google-button';
import FacebookButton from '../common/facebook-button';
import { Link as RouterLink } from 'react-router';
import { recaptchaContainerStyle } from './style';
import { ClientContext } from '../../classes/provider/client-context';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { SEOHead } from '../seo';
import { getCanonicalUrl, getAlternateLanguageUrls } from '../../utils/seo-locale';

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

  const client = useContext(ClientContext);
  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => client.registerNewUser({ ...model }),
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

  // Generic OAuth registration handler
  const handleOAuthRegister = (authUrl: string | undefined, providerName: string): void => {
    if (!authUrl) {
      console.error(`${providerName} OAuth callback URL is null`);
      return;
    }
    window.location.href = authUrl;
  };

  return (
    <Grid container justifyContent="center">
      <Grid container spacing={0} justifyContent="center" alignItems="scretch" textAlign="center">
        <Grid size={{ md: 5, xs: 12 }} justifyContent="center">
          <header>
            <Typography variant="h4" component="h1">
              <FormattedMessage id="registration.title" defaultMessage="Become a member" />
            </Typography>

            <Typography paragraph>
              <FormattedMessage
                id="registration.desc"
                defaultMessage="Signing up is free and just take a moment "
              />
            </Typography>
          </header>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {AppConfig.isFacebookOauth2Enabled() && (
              <FacebookButton
                text={intl.formatMessage({
                  id: 'registration.facebook.button',
                  defaultMessage: 'Sign up with Facebook',
                })}
                onClick={() => handleOAuthRegister(AppConfig.getFacebookOauth2Url(), 'Facebook')}
              />
            )}
            {AppConfig.isGoogleOauth2Enabled() && (
              <GoogleButton
                text={intl.formatMessage({
                  id: 'registration.google.button',
                  defaultMessage: 'Sign up with Google',
                })}
                onClick={() => handleOAuthRegister(AppConfig.getGoogleOauth2Url(), 'Google')}
              />
            )}
          </Box>
        </Grid>
        <Grid size={{ md: 2, xs: 12 }}>
          <Separator
            responsive={true}
            maxWidth={maxFormWidth}
            text={intl.formatMessage({
              id: 'registration.division',
              defaultMessage: 'or',
            })}
          />
        </Grid>
        <Grid size={{ md: 5, xs: 12 }}>
          <main>
            <FormControl css={{ maxWidth: maxFormWidth }}>
              <form
                onSubmit={handleOnSubmit}
                role="form"
                aria-label={intl.formatMessage({
                  id: 'common.registration-form',
                  defaultMessage: 'Registration form',
                })}
              >
                <GlobalError
                  error={error}
                  title={
                    error
                      ? intl.formatMessage({
                          id: 'registration.error.title',
                          defaultMessage: 'Registration Failed',
                        })
                      : undefined
                  }
                />
                <fieldset>
                  <legend>
                    <FormattedMessage
                      id="registration.form-legend"
                      defaultMessage="Account Information"
                    />
                  </legend>
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
                    required={true}
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
                    required={true}
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
                    required={true}
                  />
                  <Input
                    name="password"
                    type="password"
                    onChange={handleOnChange}
                    minLength={8}
                    maxLength={39}
                    label={intl.formatMessage({
                      id: 'registration.password',
                      defaultMessage: 'Password',
                    })}
                    autoComplete="new-password"
                    error={error}
                    required={true}
                  />

                  {AppConfig.isRecaptcha2Enabled() && (
                    <>
                      {}
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
                    isLoading={mutation.isLoading}
                  />
                </fieldset>
              </form>
            </FormControl>
          </main>
        </Grid>
      </Grid>
      <Grid>
        <Link component={RouterLink} to="/c/login">
          <FormattedMessage id="header.haveaccount" defaultMessage="Already have an account?" />
        </Link>
      </Grid>
    </Grid>
  );
};

const RegistationPage = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registration.page-title',
      defaultMessage: 'Registration | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Registration:Init');
  }, []);

  // Redirect to login if registration is disabled
  useEffect(() => {
    if (!AppConfig.isRegistrationEnabled()) {
      navigate('/c/login');
    }
  }, [navigate]);

  // Don't render if registration is disabled
  if (!AppConfig.isRegistrationEnabled()) {
    return <></>;
  }

  const canonicalUrl = getCanonicalUrl('/c/registration');
  const alternateLanguages = getAlternateLanguageUrls('/c/registration');
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.wisemapping.com';

  return (
    <>
      <SEOHead
        title="Sign Up | WiseMapping"
        description="Create your free WiseMapping account to start creating mind maps, organizing ideas, and collaborating with others. Join thousands of users worldwide."
        keywords="sign up, register, create account, mind mapping, free account, collaboration, brainstorming"
        canonicalUrl={canonicalUrl}
        alternateLanguages={alternateLanguages}
        ogType="website"
        robots="index, follow"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Sign Up - WiseMapping',
          description:
            'Create your free WiseMapping account to start creating mind maps, organizing ideas, and collaborating with others.',
          url: `${baseUrl}${canonicalUrl}`,
          mainEntity: {
            '@type': 'WebApplication',
            name: 'WiseMapping',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        }}
      />
      <AccountAccessLayout
        headerType="only-signin"
        contentSx={{
          padding: { xs: '8px 16px', md: '16px 16px' },
        }}
      >
        <RegistrationForm />
      </AccountAccessLayout>
    </>
  );
};

export default RegistationPage;
