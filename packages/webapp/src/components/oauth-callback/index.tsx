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

import React, { useContext, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink, useLocation } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { trackPageView, setAnalyticsUserEmail } from '../../utils/analytics';
import { Oauth2CallbackResult, ErrorInfo } from '../../classes/client';
import { useNavigate } from 'react-router';
import GlobalError from '../form/global-error';
import { buttonsStyle } from './style';
import { ClientContext } from '../../classes/provider/client-context';
import { logCriticalError } from '../../utils';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '../../contexts/ThemeContext';
import JwtTokenConfig from '../../classes/jwt-token-config';
import { DEFAULT_REDIRECT, leaveTo, safeRedirectPath } from '../../utils/redirect';
import { takeOAuthFlow } from '../../utils/oauth-flow';

type OAuthProvider = 'google' | 'facebook';

type OAuthCallbackParams =
  | { kind: 'token'; jwtToken: string; email: string; oauthSync: boolean; syncCode?: string }
  | { kind: 'code'; code: string };

// Spring Boot OAuth2 sends the JWT itself; the legacy endpoints send a code to exchange.
// 'invalid': a token whose account can not be read, or that is not the account the link names.
const readCallbackParams = (
  searchParams: URLSearchParams,
): OAuthCallbackParams | 'invalid' | undefined => {
  const jwtToken = searchParams.get('jwtToken');
  if (jwtToken) {
    // The account is the token's subject. The email parameter is only a copy that anyone can
    // edit: shown on the confirmation, a forged one would make an attacker's token look like the
    // victim's own sign-in.
    const subject = JwtTokenConfig.getSubject(jwtToken);
    const email = searchParams.get('email');
    if (!subject || (email && email.toLowerCase() !== subject.toLowerCase())) {
      return 'invalid';
    }
    return {
      kind: 'token',
      jwtToken,
      email: subject,
      oauthSync: searchParams.get('oauthSync') === 'true',
      syncCode: searchParams.get('syncCode') || undefined,
    };
  }
  const code = searchParams.get('code');
  return code ? { kind: 'code', code } : undefined;
};

const SECRET_PARAMS = ['jwtToken', 'email', 'syncCode', 'code', 'oauthSync'];

const scrubCallbackParams = (): void => {
  const url = new URL(window.location.href);
  SECRET_PARAMS.forEach((name) => url.searchParams.delete(name));
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
};

const OAuthCallbackPage = (): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { initializeThemeFromSystem } = useTheme();

  const [error, setError] = useState<ErrorInfo | undefined>();
  const [callbackResult, setCallbackResult] = useState<Oauth2CallbackResult>();
  // A callback that did not start from a sign-in in this tab, held until the user confirms it.
  const [unconfirmed, setUnconfirmed] = useState<OAuthCallbackParams>();
  // Where to go once signed in: a path on this site only (see safeRedirectPath).
  const redirectTarget = useRef<string>(DEFAULT_REDIRECT);

  // Route through login page so Google Ads vignette fires from a page with ads already loaded.
  const navigateAfterOAuth = (): void => {
    leaveTo(`/c/login?redirect=${encodeURIComponent(redirectTarget.current)}`);
  };

  // Determine OAuth provider based on route path
  const provider: OAuthProvider = location.pathname.includes('facebook') ? 'facebook' : 'google';
  const providerName = provider === 'facebook' ? 'Facebook' : 'Google';

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registation.success-title',
      defaultMessage: 'Registation Success | WiseMapping',
    });
  }, [intl]);

  // Once per visit: a language change retitles the page but is not a new page view.
  useEffect(() => {
    trackPageView(window.location.pathname, 'Registration:Success');
  }, []);

  const processCallback = (params: OAuthCallbackParams): void => {
    if (params.kind === 'token') {
      // This is a Spring Boot OAuth2 callback - process directly
      JwtTokenConfig.storeToken(params.jwtToken);
      setAnalyticsUserEmail(params.email);

      if (params.oauthSync) {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();
        navigateAfterOAuth();
        return;
      }
      setCallbackResult({
        email: params.email,
        oauthSync: params.oauthSync,
        syncCode: params.syncCode,
      });
      return;
    }

    // Legacy OAuth callback handling (old custom OAuth endpoints)
    const callbackPromise =
      provider === 'facebook'
        ? client.processFacebookCallback(params.code)
        : client.processGoogleCallback(params.code);

    callbackPromise
      .then((result) => {
        if (result.oauthSync) {
          // Initialize theme from system preference if not already set
          initializeThemeFromSystem();
          navigateAfterOAuth();
          return;
        }
        setCallbackResult(result);
      })
      .catch((errorInfo: ErrorInfo) => {
        setError(errorInfo);
        logCriticalError(`Unexpected error on ${provider} OAuth callback`, errorInfo);
      });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const flow = takeOAuthFlow();
    redirectTarget.current = safeRedirectPath(flow?.redirect ?? searchParams.get('state'));

    // Check if user cancelled the OAuth flow
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');

    if (error) {
      // User cancelled or denied access - redirect to login
      if (error === 'access_denied' || errorReason === 'user_denied') {
        navigate('/c/login');
        return;
      }

      // Other OAuth errors - show error message
      const errorDescription = searchParams.get('error_description');
      setError({
        msg: errorDescription || `OAuth error: ${error}`,
      });
      return;
    }

    const params = readCallbackParams(searchParams);
    // The token, code and email must not stay in the address bar, the history or the Referer.
    scrubCallbackParams();
    if (!params) {
      setError({
        msg: `Missing OAuth code or token in callback: ${window.location.search}`,
      });
      return;
    }
    if (params === 'invalid') {
      setError({
        msg: intl.formatMessage({
          id: 'registration.callback.invalid',
          defaultMessage: 'This sign-in link is not valid. Please sign in again.',
        }),
      });
      return;
    }

    if (flow) {
      processCallback(params);
    } else {
      setUnconfirmed(params);
    }
    // Once, on arrival: the OAuth code in the URL is single-use, and initializeThemeFromSystem is a
    // new function on every ThemeContext render, so re-running would post the spent code again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmAccountSynching = (): void => {
    const callback = callbackResult;
    if (!callback) {
      throw new Error(`callbackResult can not be null`);
    }

    client
      .confirmAccountSync(callback.email, callback.syncCode, provider)
      .then(() => {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();
        navigateAfterOAuth();
      })
      .catch((errorInfo: ErrorInfo) => {
        setError(errorInfo);

        // Check for session expiry during pending oauth
        let probableCause: string | undefined;
        if (errorInfo.status === 401 && callback.syncCode === 'oauth_pending') {
          probableCause =
            'Session expired while waiting for OAuth confirmation. This can happen if the session cookie is lost or expired during the redirect.';
          console.warn(probableCause);
        }

        // Add detailed debug information for troubleshooting. The URL is left out: before it is
        // scrubbed it carries the JWT, and the path is all the log needs.
        const debugInfo = {
          errorInfo,
          probableCause,
          context: {
            email: callback.email,
            syncCode: callback.syncCode || '(not provided)',
            redirectTarget: redirectTarget.current,
            provider,
            path: window.location.pathname,
          },
        };
        logCriticalError(
          `Unexpected error on confirmAccountSynching. Provider: ${provider}, Status: ${errorInfo.status || 'unknown'}, Message: ${errorInfo.msg || 'none'}`,
          debugInfo,
        );
      });
  };

  // if service reports that user doesnt sync accounts yet, we need to show the options
  const needConfirmLinking = !error && callbackResult?.email && !callbackResult?.oauthSync;
  const needConfirmSignIn = !error && unconfirmed !== undefined;

  // Show the standard OAuth callback page with form container
  return (
    <div>
      <Header type="none" />
      <FormContainer>
        <Typography variant="h4" component="h1">
          {needConfirmSignIn ? (
            <FormattedMessage
              id="registration.callback.confirm-signin.title"
              defaultMessage="Continue signing in?"
            />
          ) : needConfirmLinking ? (
            <FormattedMessage id="registration.callback.confirm.title" defaultMessage="Confirm" />
          ) : (
            <FormattedMessage
              id="registration.callback.waiting.title"
              defaultMessage="Finishing..."
            />
          )}
        </Typography>
        <Typography
          sx={{
            marginBottom: '16px',
          }}
        >
          {needConfirmSignIn ? (
            unconfirmed.kind === 'token' ? (
              <FormattedMessage
                id="registration.callback.confirm-signin.account"
                defaultMessage="You are about to sign in to WiseMapping with {provider} as {email}. Continue only if you started this sign-in yourself."
                values={{ provider: providerName, email: unconfirmed.email }}
              />
            ) : (
              <FormattedMessage
                id="registration.callback.confirm-signin.description"
                defaultMessage="You are about to sign in to WiseMapping with {provider}. Continue only if you started this sign-in yourself."
                values={{ provider: providerName }}
              />
            )
          ) : needConfirmLinking ? (
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
          <div key="error-state">
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
          </div>
        )}

        {!needConfirmLinking && !needConfirmSignIn && !error && <CircularProgress />}

        {needConfirmSignIn && (
          <div key="confirm-signin">
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
                setUnconfirmed(undefined);
                processCallback(unconfirmed);
              }}
              color="primary"
              size="medium"
              variant="contained"
              disableElevation={true}
              css={buttonsStyle}
            >
              <FormattedMessage id="registration.callback.continue" defaultMessage="Continue" />
            </Button>
          </div>
        )}

        {needConfirmLinking && (
          <div key="confirm-sync">
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
          </div>
        )}
      </FormContainer>
      <Footer />
    </div>
  );
};

export default OAuthCallbackPage;
