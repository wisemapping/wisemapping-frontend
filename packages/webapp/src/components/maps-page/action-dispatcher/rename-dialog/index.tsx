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
import { useMutation, useQueryClient } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import { SimpleDialogProps, handleOnMutationSuccess } from '..';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';
import FormControl from '@mui/material/FormControl';
import { useFetchMapById } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';

export type RenameModel = {
  id: number;
  title: string;
  description?: string;
};

const defaultModel: RenameModel = { title: '', description: '', id: -1 };
const RenameDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<RenameModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const intl = useIntl();
  const queryClient = useQueryClient();

  const mutation = useMutation<RenameModel, ErrorInfo, RenameModel>(
    (model: RenameModel) => {
      const { id, ...rest } = model;
      return client.renameMap(id, rest).then(() => model);
    },
    {
      onSuccess: () => {
        handleOnMutationSuccess(onClose, queryClient);
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

    // Validate that mapId is valid (0 is a valid ID)
    if (mapId == null || Number.isNaN(mapId)) {
      setError({
        msg: intl.formatMessage({
          id: 'error.invalid-map-id',
          defaultMessage: 'Invalid map ID',
        }),
      });
      return;
    }

    // Use mapId from props, not model.id, to ensure it's always valid
    const validatedModel: RenameModel = {
      id: mapId,
      title: model.title,
      description: model.description,
    };

    mutation.mutate(validatedModel);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const name = event.target.name;
    const value = event.target.value;

    // Clear any previous errors when user starts typing
    if (error) {
      setError(undefined);
    }

    // Update the model with the correct field name
    // Only update title and description, preserve id from mapId prop
    if (name === 'title') {
      setModel({ ...model, title: value });
    } else if (name === 'description') {
      setModel({ ...model, description: value });
    }
  };

  const { data: map } = useFetchMapById(mapId);

  // Validate mapId - show error if invalid (0 is a valid ID)
  useEffect(() => {
    if (mapId == null || Number.isNaN(mapId)) {
      setError({
        msg: intl.formatMessage({
          id: 'error.invalid-map-id',
          defaultMessage: 'Invalid map ID',
        }),
      });
      return;
    }
  }, [mapId, intl]);

  useEffect(() => {
    if (map) {
      setModel(map);
    }
  }, [map]);

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        error={error}
        title={intl.formatMessage({ id: 'rename.title', defaultMessage: 'Rename' })}
        description={intl.formatMessage({
          id: 'rename.description',
          defaultMessage: 'Please, fill the new map name and description.',
        })}
        submitButton={intl.formatMessage({ id: 'rename.title', defaultMessage: 'Rename' })}
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

export default RenameDialog;
