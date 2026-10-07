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

import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MemoTextField from '../shared/MemoTextField';
import { UserFormData } from './types';

type UserFormDialogProps = {
  open: boolean;
  title: string;
  /** The form's starting values, read when the dialog mounts: give it a new `key` to reset it. */
  initialData: UserFormData;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onClose: () => void;
  /** Called with a valid form; resolves to the message to show when saving it failed. */
  onSubmit: (data: UserFormData) => Promise<string | undefined>;
};

/**
 * The create / edit user dialog. It owns the form, so that a key re-renders this dialog and not
 * the accounts page, and its fields are memoised, so that a key re-renders only the field typed
 * in (see MemoTextField).
 */
const UserFormDialog = ({
  open,
  title,
  initialData,
  submitLabel,
  pendingLabel,
  isPending,
  onClose,
  onSubmit,
}: UserFormDialogProps): ReactElement => {
  const intl = useIntl();
  const [formData, setFormData] = useState<UserFormData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFirstnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, firstname: e.target.value })),
    [],
  );
  const handleLastnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, lastname: e.target.value })),
    [],
  );
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, email: e.target.value })),
    [],
  );

  // The locale select and the email switch do not take part in typing.
  const localeSelect = useMemo(
    () => (
      <FormControl fullWidth>
        <InputLabel>Locale</InputLabel>
        <Select
          value={formData.locale}
          label={intl.formatMessage({ id: 'common.locale', defaultMessage: 'Locale' })}
          onChange={(e: SelectChangeEvent) =>
            setFormData((current) => ({ ...current, locale: e.target.value }))
          }
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Spanish</MenuItem>
          <MenuItem value="fr">French</MenuItem>
          <MenuItem value="de">German</MenuItem>
          <MenuItem value="it">Italian</MenuItem>
          <MenuItem value="pt">Portuguese</MenuItem>
        </Select>
      </FormControl>
    ),
    [formData.locale, intl],
  );
  const allowSendEmailSwitch = useMemo(
    () => (
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowSendEmail}
            onChange={(e) =>
              setFormData((current) => ({ ...current, allowSendEmail: e.target.checked }))
            }
          />
        }
        label={intl.formatMessage({
          id: 'common.allow-email-notifications',
          defaultMessage: 'Allow Email Notifications',
        })}
      />
    ),
    [formData.allowSendEmail, intl],
  );

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      errors.firstname = intl.formatMessage({
        id: 'admin.validation.firstname-required',
        defaultMessage: 'First name is required',
      });
    }
    if (!formData.lastname.trim()) {
      errors.lastname = intl.formatMessage({
        id: 'admin.validation.lastname-required',
        defaultMessage: 'Last name is required',
      });
    }
    if (!formData.email.trim()) {
      errors.email = intl.formatMessage({
        id: 'admin.validation.email-required',
        defaultMessage: 'Email is required',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = intl.formatMessage({
        id: 'admin.validation.email-invalid',
        defaultMessage: 'Invalid email format',
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const failure = await onSubmit(formData);
    if (failure) {
      setFormErrors({ general: failure });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {formErrors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrors.general}
          </Alert>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <MemoTextField
            label={intl.formatMessage({ id: 'common.first-name', defaultMessage: 'First Name' })}
            value={formData.firstname}
            onChange={handleFirstnameChange}
            error={!!formErrors.firstname}
            helperText={formErrors.firstname}
            fullWidth
            required
          />
          <MemoTextField
            label={intl.formatMessage({ id: 'common.last-name', defaultMessage: 'Last Name' })}
            value={formData.lastname}
            onChange={handleLastnameChange}
            error={!!formErrors.lastname}
            helperText={formErrors.lastname}
            fullWidth
            required
          />
          <MemoTextField
            label={intl.formatMessage({ id: 'common.email', defaultMessage: 'Email' })}
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            fullWidth
            required
          />
          {localeSelect}
          {allowSendEmailSwitch}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
