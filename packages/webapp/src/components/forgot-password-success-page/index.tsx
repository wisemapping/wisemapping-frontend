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
import AccountAccessLayout from '../layout/AccountAccessLayout';
import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { trackPageView } from '../../utils/analytics';

const ForgotPasswordSuccessPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'forgotsuccess.page-title',
      defaultMessage: 'Password Recovered | WiseMapping',
    });
    trackPageView(window.location.pathname, 'ForgotPassword:Success');
  });

  return (
    <AccountAccessLayout headerType="none">
      <FormContainer>
        <Typography variant="h4" component="h1">
          <FormattedMessage
            id="forgot.success.title"
            defaultMessage="Your temporal password has been sent."
          />
        </Typography>

        <Typography paragraph>
          <FormattedMessage
            id="forgot.success.desc"
            defaultMessage="We've sent you an email that will allow you to reset your password. You should receive it in the next minutes."
          />
        </Typography>

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
      </FormContainer>
    </AccountAccessLayout>
  );
};

export default ForgotPasswordSuccessPage;
