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

import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FormContainer from '../layout/form-container';
import Header from '../layout/header';
import Footer from '../layout/footer';
import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { trackPageView } from '../../utils/analytics';

const RegistrationSuccessPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'registation.success-title',
      defaultMessage: 'Registation Success | WiseMapping',
    });
    trackPageView(window.location.pathname, 'Registration:Success');
  });

  return (
    <div>
      <Header type="none" />
      <FormContainer>
        <Typography variant="h4" component="h1" gutterBottom>
          <FormattedMessage
            id="registration.success.title"
            defaultMessage="Registration Successful!"
          />
        </Typography>

        <Typography paragraph>
          <FormattedMessage
            id="registration.success.email-sent"
            defaultMessage="We've sent an activation email to your inbox. Please check your email and click on the activation link to activate your account."
          />
        </Typography>

        <Typography paragraph style={{ marginBottom: '2rem' }}>
          <FormattedMessage
            id="registration.success.check-spam"
            defaultMessage="If you don't see the email, please check your spam folder."
          />
        </Typography>

        <Typography variant="body2" color="textSecondary">
          <FormattedMessage
            id="registration.success.already-activated"
            defaultMessage="Already activated your account?"
          />
        </Typography>

        <Button
          color="primary"
          size="medium"
          variant="contained"
          component={RouterLink}
          to="/c/login"
          disableElevation={true}
          style={{ marginTop: '1rem' }}
        >
          <FormattedMessage id="login.signin" defaultMessage="Sign In" />
        </Button>
      </FormContainer>
      <Footer />
    </div>
  );
};

export default RegistrationSuccessPage;
