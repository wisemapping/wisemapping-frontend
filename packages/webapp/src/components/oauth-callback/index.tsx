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
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink, useLocation } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { trackPageView } from '../../utils/analytics';
import { Oauth2CallbackResult, ErrorInfo } from '../../classes/client';
import { useNavigate } from 'react-router';
import GlobalError from '../form/global-error';
import { buttonsStyle } from './style';
import { ClientContext } from '../../classes/provider/client-context';
import { logCriticalError } from '../../utils';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '../../contexts/ThemeContext';
import { MapsPageLoading } from '../maps-page/maps-list/MapsListSkeleton';
import JwtTokenConfig from '../../jwt-token-config';

type OAuthProvider = 'google' | 'facebook';

const OAuthCallbackPage = (): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { initializeThemeFromSystem } = useTheme();

  const [error, setError] = useState<ErrorInfo | undefined>();
  const [callbackResult, setCallbackResult] = useState<Oauth2CallbackResult>();

  // Determine OAuth provider based on route path
  const provider: OAuthProvider = location.pathname.includes('facebook') ? 'facebook' : 'google';
  const providerName = provider === 'facebook' ? 'Facebook' : 'Google';

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registation.success-title',
      defaultMessage: 'Registation Success | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Registration:Success');
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Check if this is a Spring Boot OAuth2 callback (with jwtToken in URL)
    const jwtToken = searchParams.get('jwtToken');
    const email = searchParams.get('email');
    const oauthSync = searchParams.get('oauthSync');
    const syncCode = searchParams.get('syncCode');

    if (jwtToken && email) {
      // This is a Spring Boot OAuth2 callback - process directly
      // Store JWT token
      if (jwtToken) {
        JwtTokenConfig.storeToken(jwtToken);
      }

      const result: Oauth2CallbackResult = {
        email: email,
        oauthSync: oauthSync === 'true',
        syncCode: syncCode || undefined,
      };

      if (result.oauthSync) {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();
        // Get redirect URL from OAuth state parameter
        const stateRedirectUrl = searchParams.get('state');
        if (stateRedirectUrl && stateRedirectUrl !== 'wisemapping') {
          navigate(stateRedirectUrl);
        } else {
          navigate('/c/maps/');
        }
      }
      setCallbackResult(result);
      return;
    }

    // Legacy OAuth callback handling (old custom OAuth endpoints)
    const oauthCode = searchParams.get('code');
    if (!oauthCode) {
      setError({
        msg: `Missing OAuth code or token in callback: ${window.location.search}`,
      });
      return;
    }

    // Get redirect URL from OAuth state parameter
    const stateRedirectUrl = searchParams.get('state');

    // Call the appropriate OAuth callback based on provider
    const callbackPromise =
      provider === 'facebook'
        ? client.processFacebookCallback(oauthCode)
        : client.processGoogleCallback(oauthCode);

    callbackPromise
      .then((result) => {
        if (result.oauthSync) {
          // Initialize theme from system preference if not already set
          initializeThemeFromSystem();
          // Use redirect URL from OAuth state parameter
          if (stateRedirectUrl && stateRedirectUrl !== 'wisemapping') {
            navigate(stateRedirectUrl);
          } else {
            // if service reports that user already has sync accounts, go to maps page
            navigate('/c/maps/');
          }
        }
        setCallbackResult(result);
      })
      .catch((errorInfo: ErrorInfo) => {
        setError(errorInfo);
        logCriticalError(`Unexpected error on ${provider} OAuth callback`, errorInfo);
      });
  }, []);

  const confirmAccountSynching = (): void => {
    const callback = callbackResult;
    if (!callback) {
      throw new Error(`callbackResult can not be null`);
    }

    // Get redirect URL from OAuth state parameter
    const searchParams = new URLSearchParams(window.location.search);
    const stateRedirectUrl = searchParams.get('state');

    client
      .confirmAccountSync(callback.email, callback.syncCode)
      .then(() => {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();
        // Use redirect URL from OAuth state parameter
        if (stateRedirectUrl && stateRedirectUrl !== 'wisemapping') {
          navigate(stateRedirectUrl);
        } else {
          navigate('/c/maps/');
        }
      })
      .catch((errorInfo: ErrorInfo) => {
        setError(errorInfo);
        logCriticalError(`Unexpected error on confirmAccountSynching`, errorInfo);
      });
  };

  // if service reports that user doesnt sync accounts yet, we need to show the options
  const needConfirmLinking = !error && callbackResult?.email && !callbackResult?.oauthSync;

  // Determine if we're redirecting to the maps list page (not editor)
  const searchParams = new URLSearchParams(window.location.search);
  const stateRedirectUrl = searchParams.get('state');
  const isRedirectingToMapsList =
    !stateRedirectUrl ||
    stateRedirectUrl === 'wisemapping' ||
    stateRedirectUrl === '/c/maps' ||
    stateRedirectUrl === '/c/maps/';
  const showMapsLoading = !needConfirmLinking && !error && isRedirectingToMapsList;

  // Show full-screen maps loading if redirecting to maps list
  if (showMapsLoading) {
    return <MapsPageLoading />;
  }

  // Otherwise show the standard OAuth callback page with form container
  return (
    <div>
      <Header type="none" />
      <FormContainer>
        <Typography variant="h4" component="h1">
          {needConfirmLinking ? (
            <FormattedMessage id="registration.callback.confirm.title" defaultMessage="Confirm" />
          ) : (
            <FormattedMessage
              id="registration.callback.waiting.title"
              defaultMessage="Finishing..."
            />
          )}
        </Typography>
        <Typography paragraph>
          {needConfirmLinking ? (
            <FormattedMessage
              id="registration.callback.confirm.description"
              defaultMessage="An account with the same email was previously registered. Do you want to link your {provider} account to that WiseMapping account?"
              values={{ provider: providerName }}
            />
          ) : (
            <FormattedMessage
              id="registration.callback.waiting.description"
              defaultMessage="Please wait while we validate your identity"
            />
          )}
        </Typography>

        {error && (
          <>
            <GlobalError error={error} />
            <Button
              color="primary"
              size="medium"
              variant="contained"
              component={RouterLink}
              to="/c/login"
              disableElevation={true}
              css={buttonsStyle}
            >
              <FormattedMessage id="registration.callback.back" defaultMessage="Back to login" />
            </Button>
          </>
        )}

        {!needConfirmLinking && !error && <CircularProgress />}

        {needConfirmLinking && (
          <>
            <Button
              color="secondary"
              size="medium"
              variant="contained"
              component={RouterLink}
              to="/c/login"
              disableElevation={true}
              css={buttonsStyle}
            >
              <FormattedMessage id="registration.callback.back" defaultMessage="Back to login" />
            </Button>
            <Button
              onClick={() => {
                confirmAccountSynching();
              }}
              color="primary"
              size="medium"
              variant="contained"
              disableElevation={true}
              css={buttonsStyle}
            >
              <FormattedMessage id="registration.callback.sync" defaultMessage="Sync account" />
            </Button>
          </>
        )}
      </FormContainer>
      <Footer />
    </div>
  );
};

export default OAuthCallbackPage;
