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

import React, { ReactElement, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { AuthenticationType } from '../../../classes/client';
import MemoTextField from '../shared/MemoTextField';
import { User } from './types';

type ChangePasswordDialogProps = {
  open: boolean;
  /** The account, read when the dialog mounts: give it a new `key` to reset the dialog. */
  user: Pick<User, 'email' | 'authenticationType'> | null;
  onClose: () => void;
  /** Called with a valid password; resolves to the message to show when the change failed. */
  onSubmit: (password: string) => Promise<string | undefined>;
};

/**
 * The admin's change password dialog. It owns the password fields, so that a key re-renders this
 * dialog and not the accounts page, and the fields are memoised, so that a key re-renders only
 * the field typed in (see MemoTextField). An OAuth account has no password to change: the dialog
 * only says so.
 */
const ChangePasswordDialog = ({
  open,
  user,
  onClose,
  onSubmit,
}: ChangePasswordDialogProps): ReactElement => {
  const intl = useIntl();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(() => {
    if (user?.authenticationType === AuthenticationType.GOOGLE_OAUTH2) {
      return intl.formatMessage({
        id: 'admin.password-error-google',
        defaultMessage:
          'This user is authenticated via Google. Password changes are not available for Google accounts. Please ask the user to manage their password through their Google account.',
      });
    }
    if (user?.authenticationType === AuthenticationType.FACEBOOK_OAUTH2) {
      return intl.formatMessage({
        id: 'admin.password-error-facebook',
        defaultMessage:
          'This user is authenticated via Facebook. Password changes are not available for Facebook accounts. Please ask the user to manage their password through their Facebook account.',
      });
    }
    return '';
  });

  const handleNewPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setPasswordError('');
  }, []);
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  }, []);

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-length',
          defaultMessage: 'Password must be at least 6 characters',
        }),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-mismatch',
          defaultMessage: 'Passwords do not match',
        }),
      );
      return;
    }

    const failure = await onSubmit(newPassword);
    if (failure) {
      setPasswordError(failure);
    } else {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
  };

  const isDatabaseAccount = user?.authenticationType === AuthenticationType.DATABASE;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {intl.formatMessage({
          id: 'admin.change-password-title',
          defaultMessage: 'Change Password',
        })}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {intl.formatMessage(
            {
              id: 'admin.change-password-description',
              defaultMessage: 'Change password for user: {email}',
            },
            { email: user?.email },
          )}
        </Typography>

        {passwordError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}

        {isDatabaseAccount && (
          <>
            <MemoTextField
              fullWidth
              type="password"
              label={intl.formatMessage({
                id: 'admin.new-password',
                defaultMessage: 'New Password',
              })}
              value={newPassword}
              onChange={handleNewPasswordChange}
              margin="normal"
              autoFocus
            />

            <MemoTextField
              fullWidth
              type="password"
              label={intl.formatMessage({
                id: 'admin.confirm-password',
                defaultMessage: 'Confirm Password',
              })}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              margin="normal"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isDatabaseAccount
            ? intl.formatMessage({ id: 'admin.cancel', defaultMessage: 'Cancel' })
            : intl.formatMessage({ id: 'admin.close', defaultMessage: 'Close' })}
        </Button>
        {isDatabaseAccount && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {intl.formatMessage({
              id: 'admin.change-password-button',
              defaultMessage: 'Change Password',
            })}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
