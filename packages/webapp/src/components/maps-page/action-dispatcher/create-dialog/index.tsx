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

import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import FormControl from '@mui/material/FormControl';

import { BasicMapInfo, ErrorInfo } from '../../../../classes/client';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';
import { ClientContext } from '../../../../classes/provider/client-context';

export type CreateModel = {
  title: string;
  description?: string;
};

export type CreateProps = {
  onClose: () => void;
};

const defaultModel: CreateModel = { title: '', description: '' };
const CreateDialog = ({ onClose }: CreateProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<CreateModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const intl = useIntl();

  const mutation = useMutation<number, ErrorInfo, CreateModel>(
    (model: CreateModel) => {
      return client.createMap(model);
    },
    {
      onSuccess: (mapId: number) => {
        window.location.href = `/c/maps/${mapId}/edit`;
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
    setError(undefined);
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof BasicMapInfo]: value });
  };

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        error={error}
        title={intl.formatMessage({
          id: 'create.title',
          defaultMessage: 'Create a new mindmap',
        })}
        description={intl.formatMessage({
          id: 'create.description',
          defaultMessage: 'Please, fill the new map name and description.',
        })}
        submitButton={intl.formatMessage({ id: 'create.button', defaultMessage: 'Create' })}
      >
        <FormControl fullWidth={true}>
          <Input
            name="title"
            type="text"
            label={intl.formatMessage({
              id: 'action.rename-name-placeholder',
              defaultMessage: 'Name',
            })}
            value={model.title}
            onChange={handleOnChange}
            error={error}
            fullWidth={true}
            maxLength={60}
          />

          <Input
            name="description"
            type="text"
            label={intl.formatMessage({
              id: 'action.rename-description-placeholder',
              defaultMessage: 'Description',
            })}
            value={model.description}
            onChange={handleOnChange}
            required={false}
            fullWidth={true}
            rows={3}
          />
        </FormControl>
      </BaseDialog>
    </div>
  );
};

export default CreateDialog;
