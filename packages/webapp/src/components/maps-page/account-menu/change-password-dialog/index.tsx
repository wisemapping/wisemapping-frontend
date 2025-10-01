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

import FormControl from '@mui/material/FormControl';
import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import Input from '../../../form/input';
import BaseDialog from '../../action-dispatcher/base-dialog';
import { ClientContext } from '../../../../classes/provider/client-context';

type ChangePasswordDialogProps = {
  onClose: () => void;
};

type ChangePasswordModel = {
  password: string;
  retryPassword: string;
};

const defaultModel: ChangePasswordModel = { password: '', retryPassword: '' };
const ChangePasswordDialog = ({ onClose }: ChangePasswordDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<ChangePasswordModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const intl = useIntl();

  const mutation = useMutation<void, ErrorInfo, ChangePasswordModel>(
    (model: ChangePasswordModel) => {
      return client.updateAccountPassword(model.password);
    },
    {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnClose = (): void => {
    onClose();
    setModel(defaultModel);
    setError(undefined);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    // Check password are equal ...
    if (model.password != model.retryPassword) {
      setError({
        msg: intl.formatMessage({
          id: 'changepwd.password-match',
          defaultMessage: 'Password do not match. Please, try again.',
        }),
      });
      return;
    }

    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof ChangePasswordModel]: value });
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      onSubmit={handleOnSubmit}
      error={error}
      title={intl.formatMessage({ id: 'changepwd.title', defaultMessage: 'Change Password' })}
      description={intl.formatMessage({
        id: 'changepwd.description',
        defaultMessage: 'Please, provide the new password for your account.',
      })}
      submitButton={intl.formatMessage({ id: 'changepwd.button', defaultMessage: 'Change' })}
    >
      <FormControl fullWidth={true}>
        <Input
          name="password"
          type="password"
          label={intl.formatMessage({
            id: 'changepwd.password',
            defaultMessage: 'Password',
          })}
          value={model.password}
          onChange={handleOnChange}
          error={error}
          fullWidth={true}
          autoComplete="new-password"
          maxLength={30}
        />

        <Input
          name="retryPassword"
          type="password"
          label={intl.formatMessage({
            id: 'changepwd.confirm-password',
            defaultMessage: 'Confirm Password',
          })}
          value={model.retryPassword}
          onChange={handleOnChange}
          required={true}
          fullWidth={true}
          autoComplete="new-password"
        />
      </FormControl>
    </BaseDialog>
  );
};
export default ChangePasswordDialog;
