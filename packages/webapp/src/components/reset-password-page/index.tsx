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
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { useMutation } from 'react-query';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import AccountAccessLayout from '../layout/AccountAccessLayout';
import FormContainer from '../layout/form-container';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import { ClientContext } from '../../classes/provider/client-context';
import { ErrorInfo } from '../../classes/client';
import { trackPageView } from '../../utils/analytics';

const ResetPassword = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const client = useContext(ClientContext);

  const token = new URLSearchParams(window.location.search).get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<ErrorInfo | undefined>(undefined);

  const mutation = useMutation<void, ErrorInfo, { token: string; password: string }>(
    ({ token, password }) => client.resetPasswordFromToken(token, password),
    {
      onSuccess: () => {
        navigate('/c/login?passwordReset=true');
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  if (!token) {
    return (
      <FormContainer>
        <Alert severity="error">
          <FormattedMessage
            id="reset-password.invalid-link"
            defaultMessage="Invalid password reset link. Please request a new one."
          />
        </Alert>
        <Button
          color="primary"
          size="medium"
          variant="contained"
          component={RouterLink}
          to="/c/forgot-password"
          disableElevation={true}
          style={{ marginTop: '1rem' }}
        >
          <FormattedMessage id="reset-password.request-new" defaultMessage="Request new link" />
        </Button>
      </FormContainer>
    );
  }

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (password.length < 8) {
      setValidationError(
        intl.formatMessage({
          id: 'reset-password.too-short',
          defaultMessage: 'Password must be at least 8 characters.',
        }),
      );
      return;
    }
    if (password.length > 40) {
      setValidationError(
        intl.formatMessage({
          id: 'reset-password.too-long',
          defaultMessage: 'Password must be less than 40 characters.',
        }),
      );
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(
        intl.formatMessage({
          id: 'reset-password.mismatch',
          defaultMessage: 'Passwords do not match.',
        }),
      );
      return;
    }

    mutation.mutate({ token, password });
  };

  return (
    <FormContainer maxWidth="xs">
      <Typography variant="h4" component="h1">
        <FormattedMessage id="reset-password.title" defaultMessage="Set a new password" />
      </Typography>

      <Typography>
        <FormattedMessage
          id="reset-password.desc"
          defaultMessage="Enter your new password below."
        />
      </Typography>

      {validationError && (
        <Alert severity="error" style={{ marginBottom: '0.5rem' }}>
          {validationError}
        </Alert>
      )}

      <GlobalError error={error} />

      <form onSubmit={handleOnSubmit}>
        <Input
          type="password"
          name="password"
          label={intl.formatMessage({
            id: 'reset-password.password',
            defaultMessage: 'New password',
          })}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        <Input
          type="password"
          name="confirmPassword"
          label={intl.formatMessage({
            id: 'reset-password.confirm-password',
            defaultMessage: 'Confirm new password',
          })}
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <SubmitButton
          value={intl.formatMessage({
            id: 'reset-password.submit',
            defaultMessage: 'Set new password',
          })}
          isLoading={mutation.isLoading}
        />
      </form>
    </FormContainer>
  );
};

const ResetPasswordPage = (): React.ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'reset-password.page-title',
      defaultMessage: 'Reset Password | WiseMapping',
    });
    trackPageView(window.location.pathname, 'ResetPassword');
  }, []);

  return (
    <AccountAccessLayout headerType="only-signin">
      <ResetPassword />
    </AccountAccessLayout>
  );
};

export default ResetPasswordPage;
