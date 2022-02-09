import React from 'react';
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import FormControl from '@mui/material/FormControl';

import Client, { BasicMapInfo, ErrorInfo } from '../../../../classes/client';
import { activeInstance } from '../../../../redux/clientSlice';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';

export type CreateModel = {
    title: string;
    description?: string;
};

export type CreateProps = {
    onClose: () => void;
};

const defaultModel: CreateModel = { title: '', description: '' };
const CreateDialog = ({ onClose }: CreateProps): React.ReactElement => {
    const client: Client = useSelector(activeInstance);
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
        }
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

export default CreateDialog;
