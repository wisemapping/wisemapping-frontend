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
import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { trackPageView } from '../../utils/analytics';
import { Oauth2CallbackResult } from '../../classes/client';
import { useNavigate } from 'react-router';
import GlobalError from '../form/global-error';
import { buttonsStyle } from './style';
import { ClientContext } from '../../classes/provider/client-context';
import { logCriticalError } from '../../utils';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '../../contexts/ThemeContext';

const RegistrationCallbackPage = (): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);

  const [showError, setShowError] = useState(false);
  const [callbackResult, setCallbackResult] = useState<Oauth2CallbackResult>();
  const navigate = useNavigate();
  const { initializeThemeFromSystem } = useTheme();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registation.success-title',
      defaultMessage: 'Registation Success | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Registration:Success');
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const googleOauthCode = searchParams.get('code');
    if (!googleOauthCode) {
      throw new Error(`Missing code definition: ${window.location.search}`);
    }

    // Get redirect URL from OAuth state parameter
    const stateRedirectUrl = searchParams.get('state');

    client
      .processGoogleCallback(googleOauthCode)
      .then((result) => {
        if (result.googleSync) {
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
      .catch((error) => {
        setShowError(true);
        logCriticalError(`Unexpected error on processGoogleCallback`, error);
      });
  }, []);

  const confirmAccountSynching = () => {
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
      .catch((error) => {
        logCriticalError(`Unexpected error on  confirmAccountSynching`, error);
      });
  };

  // if service reports that user doesnt sync accounts yet, we need to show the options
  const needConfirmLinking = !showError && callbackResult?.email && !callbackResult?.googleSync;

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
              defaultMessage="An account with the same email was previously registered. Do you want to link your google account to that WiseMapping account?"
            />
          ) : (
            <FormattedMessage
              id="registration.callback.waiting.description"
              defaultMessage="Please wait while we validate your identity"
            />
          )}
        </Typography>

        {showError && (
          <>
            <GlobalError
              error={{
                msg: intl.formatMessage({
                  id: 'registation.callback.error.message',
                  defaultMessage:
                    'An error occurred validating your identity with Google, you can try again from the login page',
                }),
              }}
            />
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

        {!needConfirmLinking && !showError && <CircularProgress />}

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

export default RegistrationCallbackPage;
