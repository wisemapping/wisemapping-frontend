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

import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import AccountAccessLayout from '../layout/AccountAccessLayout';
import SubmitButton from '../form/submit-button';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import FormContainer from '../layout/form-container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Separator from '../common/separator';
import GoogleButton from '../common/google-button';
import FacebookButton from '../common/facebook-button';
import AppConfig from '../../classes/app-config';
import { useMutation } from 'react-query';
import { ErrorInfo, LoginErrorInfo } from '../../classes/client';
import { ClientContext } from '../../classes/provider/client-context';
import { SEOHead } from '../seo';
import { useTheme } from '../../contexts/ThemeContext';
import { trackPageView } from '../../utils/analytics';
import { getCanonicalUrl, getAlternateLanguageUrls } from '../../utils/seo-locale';

export type Model = {
  email: string;
  password: string;
};

export type LoginErrorProps = {
  error: LoginErrorInfo | undefined;
};

const defaultModel: Model = { email: '', password: '' };

const LoginError = ({ error }: LoginErrorProps) => {
  const intl = useIntl();

  let msg: null | string = null;
  if (error) {
    // Always use the backend error message
    msg =
      error.msg ||
      intl.formatMessage({
        id: 'login.error',
        defaultMessage: 'The email address or password you entered is not valid.',
      });
  }
  return msg ? <GlobalError error={{ msg: msg }} /> : null;
};

const LoginPage = (): React.ReactElement => {
  const intl = useIntl();
  const [model, setModel] = useState<Model>(defaultModel);
  const [loginError, setLoginError] = useState<LoginErrorInfo | undefined>(undefined);

  const client = useContext(ClientContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeThemeFromSystem } = useTheme();

  // Check if user came from a shared link
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');
  const isSharedLink = redirectUrl?.includes('shared=true') || false;
  const oauthError = searchParams.get('error');

  // Generic OAuth handler
  const handleOAuthLogin = (authUrl: string | undefined, providerName: string): void => {
    if (!authUrl) {
      console.log(`${providerName} OAuth URL is not configured.`);
      return;
    }

    // Pass redirect URL via OAuth state parameter
    let finalAuthUrl = authUrl;
    if (redirectUrl) {
      const url = new URL(authUrl);
      url.searchParams.set('state', redirectUrl);
      finalAuthUrl = url.toString();
    }
    window.location.href = finalAuthUrl;
  };

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'login.page-title',
      defaultMessage: 'Login | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Login');
  }, []);

  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => client.login({ ...model }),
    {
      onSuccess: () => {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();

        // If the url has been defined, redirect to the original url.
        let redirectUrl = new URLSearchParams(location.search).get('redirect');
        redirectUrl = redirectUrl ? redirectUrl : '/c/maps/';
        console.log(`redirectUrl: ${redirectUrl}`);
        navigate(redirectUrl);
      },
      onError: (error: LoginErrorInfo) => {
        setLoginError(error);
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

  const canonicalUrl = getCanonicalUrl('/c/login');
  const alternateLanguages = getAlternateLanguageUrls('/c/login');
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.wisemapping.com';

  return (
    <>
      <SEOHead
        title="Login | WiseMapping"
        description="Sign in to your WiseMapping account to access your mind maps, create new ones, and collaborate with others. Free online mind mapping tool."
        keywords="login, sign in, mind mapping, wise mapping, account access, collaboration"
        canonicalUrl={canonicalUrl}
        alternateLanguages={alternateLanguages}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Login - WiseMapping',
          description:
            'Sign in to your WiseMapping account to access your mind maps, create new ones, and collaborate with others.',
          url: `${baseUrl}${canonicalUrl}`,
          mainEntity: {
            '@type': 'WebApplication',
            name: 'WiseMapping',
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web Browser',
          },
        }}
      />
      <AccountAccessLayout headerType={AppConfig.isRegistrationEnabled() ? 'only-signup' : 'none'}>
        <FormContainer>
          <header>
            <Typography variant="h4" component="h1">
              <FormattedMessage id="login.title" defaultMessage="Welcome" />
            </Typography>

            <Typography paragraph>
              <FormattedMessage id="login.desc" defaultMessage="Log into your account" />
            </Typography>
          </header>

          {isSharedLink && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <FormattedMessage
                id="login.shared-map-notice"
                defaultMessage="A mind map has been shared with you. Please log in to access it. Don't have an account? Sign up for free or use your Google/Facebook account."
              />
            </Alert>
          )}

          {oauthError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {oauthError === 'oauth_failed' && (
                <FormattedMessage
                  id="login.oauth-error"
                  defaultMessage="OAuth authentication failed. Please try again or use a different sign-in method."
                />
              )}
              {oauthError === 'server_error' && (
                <FormattedMessage
                  id="login.server-error"
                  defaultMessage="An unexpected error occurred. Please try again later."
                />
              )}
              {oauthError !== 'oauth_failed' && oauthError !== 'server_error' && (
                <FormattedMessage
                  id="login.generic-error"
                  defaultMessage="An error occurred during authentication. Please try again."
                />
              )}
            </Alert>
          )}

          <LoginError error={loginError} />

          <main>
            <FormControl>
              <form
                onSubmit={handleOnSubmit}
                role="form"
                aria-label={intl.formatMessage({
                  id: 'common.login-form',
                  defaultMessage: 'Login form',
                })}
              >
                <fieldset>
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
                    maxLength={39}
                  />
                  <SubmitButton
                    value={intl.formatMessage({
                      id: 'login.signin',
                      defaultMessage: 'Sign In',
                    })}
                    isLoading={mutation.isLoading}
                  />
                </fieldset>
              </form>
            </FormControl>
          </main>
          <Link component={RouterLink} to="/c/forgot-password">
            <FormattedMessage id="login.forgotpwd" defaultMessage="Forgot Password ?" />
          </Link>
          {(AppConfig.isGoogleOauth2Enabled() || AppConfig.isFacebookOauth2Enabled()) && (
            <>
              <Separator
                responsive={false}
                text={intl.formatMessage({
                  id: 'login.division',
                  defaultMessage: 'or',
                })}
              />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  width: '100%',
                  marginBottom: '-20px',
                }}
              >
                {AppConfig.isFacebookOauth2Enabled() && (
                  <FacebookButton
                    text={intl.formatMessage({
                      id: 'login.facebook.button',
                      defaultMessage: 'Sign in with Facebook',
                    })}
                    onClick={() => handleOAuthLogin(AppConfig.getFacebookOauth2Url(), 'Facebook')}
                  />
                )}
                {AppConfig.isGoogleOauth2Enabled() && (
                  <GoogleButton
                    text={intl.formatMessage({
                      id: 'login.google.button',
                      defaultMessage: 'Sign in with Google',
                    })}
                    onClick={() => handleOAuthLogin(AppConfig.getGoogleOauth2Url(), 'Google')}
                  />
                )}
              </Box>
            </>
          )}
        </FormContainer>
      </AccountAccessLayout>
    </>
  );
};

export default LoginPage;
