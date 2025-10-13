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

import React, { useEffect, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { trackPageView } from '../../utils/analytics';
import { ClientContext } from '../../classes/provider/client-context';

const ActivationPage = (): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'activation.page-title',
      defaultMessage: 'Account Activation | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Activation');
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      setError('Invalid activation link');
      setLoading(false);
      return;
    }

    client
      .activateAccount(code)
      .then(() => {
        setSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Activation failed');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Header type="none" />
      <FormContainer>
        {loading ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              <FormattedMessage
                id="activation.loading.title"
                defaultMessage="Activating Your Account"
              />
            </Typography>
            <CircularProgress />
            <Typography paragraph style={{ marginTop: '1rem' }}>
              <FormattedMessage
                id="activation.loading.desc"
                defaultMessage="Please wait while we activate your account..."
              />
            </Typography>
          </>
        ) : success ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              <FormattedMessage
                id="activation.success.title"
                defaultMessage="Account Activated Successfully"
              />
            </Typography>

            <Alert severity="success" style={{ marginBottom: '1rem' }}>
              <FormattedMessage
                id="activation.success.message"
                defaultMessage="Your account has been activated. You can now sign in and start creating mind maps."
              />
            </Alert>

            <Button
              color="primary"
              size="medium"
              variant="contained"
              component={RouterLink}
              to="/c/login"
              disableElevation={true}
            >
              <FormattedMessage id="login.signin" defaultMessage="Sign In" />
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              <FormattedMessage id="activation.error.title" defaultMessage="Activation Failed" />
            </Typography>

            <Alert severity="error" style={{ marginBottom: '1rem' }}>
              <FormattedMessage
                id="activation.error.message"
                defaultMessage="We couldn't activate your account. The activation link may be invalid or expired. Please contact support for assistance."
              />
            </Alert>

            <Button
              color="primary"
              size="medium"
              variant="contained"
              component={RouterLink}
              to="/c/login"
              disableElevation={true}
            >
              <FormattedMessage id="login.signin" defaultMessage="Sign In" />
            </Button>
          </>
        )}
      </FormContainer>
      <Footer />
    </div>
  );
};

export default ActivationPage;
