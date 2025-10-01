import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ReactGA from 'react-ga4';
import { Oauth2CallbackResult } from '../../classes/client';
import { useNavigate } from 'react-router';
import GlobalError from '../form/global-error';
import { buttonsStyle } from '../registration-callback/style';
import { ClientContext } from '../../classes/provider/client-context';
import { logCriticalError } from '@wisemapping/core-js';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '../../contexts/ThemeContext';

const RegistrationFacebookCallbackPage = (): React.ReactElement => {
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
    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname,
      title: 'Registration:Success',
    });
  });

  useEffect(() => {
    const facebookOauthCode = new URLSearchParams(window.location.search).get('code');
    if (!facebookOauthCode) {
      throw new Error(`Missing code definition: ${window.location.search}`);
    }

    client
      .processFacebookCallback(facebookOauthCode)
      .then((result) => {
        if (result.googleSync) {
          // Initialize theme from system preference if not already set
          initializeThemeFromSystem();
          // if service reports that user already has sync accounts, go to maps page
          navigate('/c/maps/');
        }
        setCallbackResult(result);
      })
      .catch((error) => {
        setShowError(true);
        logCriticalError(`Unexpected error on processFacebookCallback`, error);
      });
  }, []);

  const confirmAccountSynching = () => {
    const callback = callbackResult;
    if (!callback) {
      throw new Error(`callbackResult can not be null`);
    }

    client
      .confirmAccountSync(callback.email, callback.syncCode)
      .then(() => {
        // Initialize theme from system preference if not already set
        initializeThemeFromSystem();
        navigate('/c/maps/');
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
              defaultMessage="An account with the same email was previously registered. Do you want to link your Facebook account to that WiseMapping account?"
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
                    'An error occurred validating your identity with Facebook, you can try again from the login page',
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

export default RegistrationFacebookCallbackPage;
