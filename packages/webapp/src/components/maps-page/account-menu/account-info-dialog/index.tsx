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

import React, { useContext, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import Input from '../../../form/input';
import BaseDialog from '../../action-dispatcher/base-dialog';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import { useFetchAccount } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';

type AccountInfoDialogProps = {
  onClose: () => void;
};

type AccountInfoModel = {
  email: string;
  firstname: string;
  lastname: string;
};

const defaultModel: AccountInfoModel = { firstname: '', lastname: '', email: '' };
const AccountInfoDialog = ({ onClose }: AccountInfoDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [remove, setRemove] = React.useState<boolean>(false);

  const [model, setModel] = React.useState<AccountInfoModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const intl = useIntl();

  const mutationChangeName = useMutation<void, ErrorInfo, AccountInfoModel>(
    (model: AccountInfoModel) => {
      return client.updateAccountInfo(model.firstname, model.lastname);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('account');
        onClose();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const mutationRemove = useMutation<void, ErrorInfo, void>(
    () => {
      return client.deleteAccount();
    },
    {
      onSuccess: () => {
        window.location.href = '/c/login';
        onClose();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const account = useFetchAccount();
  useEffect(() => {
    if (account) {
      setModel({
        email: account?.email,
        lastname: account?.lastname,
        firstname: account?.firstname,
      });
    }
  }, [account?.email]);

  const handleOnClose = (): void => {
    onClose();
    setModel(defaultModel);
    setError(undefined);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (remove) {
      mutationRemove.mutate();
    } else {
      mutationChangeName.mutate(model);
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof AccountInfoModel]: value });
  };

  const handleOnRemoveChange = (event) => {
    setRemove(event.target.checked);
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      onSubmit={handleOnSubmit}
      error={error}
      title={intl.formatMessage({ id: 'accountinfo.title', defaultMessage: 'Account info' })}
      submitButton={intl.formatMessage({
        id: 'accountinfo.button',
        defaultMessage: 'Accept',
      })}
    >
      <FormControl fullWidth={true}>
        <Input
          name="email"
          type="text"
          disabled={true}
          label={intl.formatMessage({ id: 'accountinfo.email', defaultMessage: 'Email' })}
          value={model.email}
          onChange={handleOnChange}
          error={error}
          fullWidth={true}
        />

        <Input
          name="firstname"
          type="text"
          label={intl.formatMessage({
            id: 'accountinfo.firstname',
            defaultMessage: 'First Name',
          })}
          value={model.firstname}
          onChange={handleOnChange}
          required={true}
          fullWidth={true}
        />

        <Input
          name="lastname"
          type="text"
          label={intl.formatMessage({
            id: 'accountinfo.lastname',
            defaultMessage: 'Last Name',
          })}
          value={model.lastname}
          onChange={handleOnChange}
          required={true}
          fullWidth={true}
        />

        <FormGroup>
          {remove && (
            <Alert severity="error">
              <FormattedMessage
                id="account.delete-warning"
                defaultMessage="Keep in mind that you will not be able retrieve any mindmap you have added. All your information will be deleted and it can not be restored."
              />
            </Alert>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={remove}
                onChange={handleOnRemoveChange}
                name="remove"
                color="primary"
              />
            }
            label={intl.formatMessage({
              id: 'accountinfo.deleteaccount',
              defaultMessage: 'Delete Account',
            })}
          />
        </FormGroup>
      </FormControl>
    </BaseDialog>
  );
};
export default AccountInfoDialog;
