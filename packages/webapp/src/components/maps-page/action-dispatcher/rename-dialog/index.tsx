import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import Client, { BasicMapInfo, ErrorInfo } from '../../../../classes/client';
import { activeInstance, useFetchMapById } from '../../../../redux/clientSlice';
import { SimpleDialogProps, handleOnMutationSuccess } from '..';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';
import FormControl from '@mui/material/FormControl';

export type RenameModel = {
  id: number;
  title: string;
  description?: string;
};

const defaultModel: RenameModel = { title: '', description: '', id: -1 };
const RenameDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const service: Client = useSelector(activeInstance);
  const [model, setModel] = React.useState<RenameModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const intl = useIntl();
  const queryClient = useQueryClient();

  const mutation = useMutation<RenameModel, ErrorInfo, RenameModel>(
    (model: RenameModel) => {
      const { id, ...rest } = model;
      return service.renameMap(id, rest).then(() => model);
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
      setModel(map);
    }
  }, [mapId]);

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
