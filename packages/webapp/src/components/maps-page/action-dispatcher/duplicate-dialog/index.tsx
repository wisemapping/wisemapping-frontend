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
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import FormControl from '@mui/material/FormControl';

import { BasicMapInfo, ErrorInfo } from '../../../../classes/client';
import Input from '../../../form/input';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import { useFetchMapById } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';

export type DuplicateModel = {
  id: number;
  title: string;
  description?: string;
};

const defaultModel: DuplicateModel = { title: '', description: '', id: -1 };
const DuplicateDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<DuplicateModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const intl = useIntl();

  const mutation = useMutation<number, ErrorInfo, DuplicateModel>(
    (model: DuplicateModel) => {
      const { id, ...rest } = model;
      return client.duplicateMap(id, rest);
    },
    {
      onSuccess: (mapId) => {
        window.location.href = `/c/maps/${mapId}/edit`;
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnClose = (): void => {
    onClose();
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

  const { data: map } = useFetchMapById(mapId);
  useEffect(() => {
    if (map) {
      setModel({ ...map, id: mapId });
    }
  }, [map, mapId]);

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        error={error}
        title={intl.formatMessage({ id: 'duplicate.title', defaultMessage: 'Duplicate' })}
        description={intl.formatMessage({
          id: 'rename.description',
          defaultMessage: 'Please, fill the new map name and description.',
        })}
        submitButton={intl.formatMessage({
          id: 'duplicate.title',
          defaultMessage: 'Duplicate',
        })}
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
          />
        </FormControl>
      </BaseDialog>
    </div>
  );
};

export default DuplicateDialog;
