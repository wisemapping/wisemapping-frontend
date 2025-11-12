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
import { ErrorInfo, ForgotPasswordResult } from '../../classes/client';

import AccountAccessLayout from '../layout/AccountAccessLayout';
import FormContainer from '../layout/form-container';
import { useMutation } from 'react-query';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import { trackPageView } from '../../utils/analytics';
import { Link as RouterLink } from 'react-router';

import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import { ClientContext } from '../../classes/provider/client-context';
import Button from '@mui/material/Button';
import { SEOHead } from '../seo';
import { getCanonicalUrl, getAlternateLanguageUrls } from '../../utils/seo-locale';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<ErrorInfo>();
  const [showOauthMessage, setShowOauthMessage] = useState<boolean>(false);
  const navigate = useNavigate();
  const intl = useIntl();

  const client = useContext(ClientContext);
  const mutation = useMutation<ForgotPasswordResult, ErrorInfo, string>(
    (email: string) => client.resetPassword(email),
    {
      onSuccess: (result) => {
        if (result.action === 'EMAIL_SENT') navigate('/c/forgot-password-success');
        if (result.action === 'OAUTH2_USER') setShowOauthMessage(true);
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(email);
  };

  if (showOauthMessage) {
    return (
      <FormContainer>
        <Typography>
          <FormattedMessage
            id="forgot.oauth.message"
            defaultMessage="You dont need password, please login using Google."
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
          <FormattedMessage id="forgot.oauth.back" defaultMessage="Back to login" />
        </Button>
      </FormContainer>
    );
  }

  return (
    <FormContainer maxWidth="xs">
      <Typography variant="h4" component="h1">
        <FormattedMessage id="forgot.title" defaultMessage="Reset your password" />
      </Typography>

      <Typography>
        <FormattedMessage
          id="forgot.desc"
          defaultMessage="We will send you an email to reset your password."
        />
      </Typography>

      <GlobalError error={error} />

      <form onSubmit={handleOnSubmit}>
        <Input
          type="email"
          name="email"
          label={intl.formatMessage({ id: 'forgot.email', defaultMessage: 'Email' })}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />

        <SubmitButton
          value={intl.formatMessage({
            id: 'forgot.register',
            defaultMessage: 'Send recovery link',
          })}
          isLoading={mutation.isLoading}
        />
      </form>
    </FormContainer>
  );
};

const ForgotPasswordPage = (): React.ReactElement => {
  const intl = useIntl();
  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'forgot.page-title',
      defaultMessage: 'Forgot Password | WiseMapping',
    });
    trackPageView(window.location.pathname, 'ForgotPassword:Init');
  }, []);

  const canonicalUrl = getCanonicalUrl('/c/forgot-password');
  const alternateLanguages = getAlternateLanguageUrls('/c/forgot-password');
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.wisemapping.com';

  return (
    <>
      <SEOHead
        title="Forgot Password | WiseMapping"
        description="Reset your WiseMapping account password. Enter your email address and we'll send you a password recovery link."
        keywords="forgot password, reset password, password recovery, account recovery, wise mapping"
        canonicalUrl={canonicalUrl}
        alternateLanguages={alternateLanguages}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Forgot Password - WiseMapping',
          description:
            "Reset your WiseMapping account password. Enter your email address and we'll send you a password recovery link.",
          url: `${baseUrl}${canonicalUrl}`,
        }}
      />
      <AccountAccessLayout headerType="only-signin">
        <ForgotPassword />
      </AccountAccessLayout>
    </>
  );
};

export { ForgotPasswordPage };
